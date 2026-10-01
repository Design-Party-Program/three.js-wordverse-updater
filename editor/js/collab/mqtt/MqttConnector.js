import { sceneToJson } from './../SceneToJson.js';
import { addWpModelToScene } from './../WpObjects/addWpModelToScene.js';
import { addWpPrimitiveToScene } from './../WpObjects/addWpPrimitiveToScene.js';
import { addAvatarToScene } from './../WpObjects/addAvatarToScene.js';
import { addWpLightToScene } from './../WpObjects/addWpLightToScene.js';

import { SetPositionCommand } from './../../../js/commands/SetPositionCommand.js';
import { SetRotationCommand } from './../../../js/commands/SetRotationCommand.js';
import { SetScaleCommand } from './../../../js/commands/SetScaleCommand.js';
import { AddObjectAndSetMetaCommand } from './../../../js/commands/AddObjectAndSetMetaCommand.js';

class MqttConnector {


  // connect mqtt pubsub  
  #mqtt = {};
  #mqttReconnectTimeout = 2000;
  #mqttHost = 'aedes.designpartyprogram.nl';
  #mqttPort = 9001;
  #mqttTopic;
  #instanceUUID;
  #editor;
  #wordpressUser = {};
  #sceneIsLoading = {state:0}
  
  mqttConnectionStatus = {status:false};

  constructor(instanceUUID, mqttTopic, sceneIsLoading, editor) {
    // console.log(`MqttConnector.constructor called {instanceUUID: ${instanceUUID}, mqttTopic: ${mqttTopic}}`)
    this.#mqttTopic = mqttTopic;
    this.#instanceUUID = instanceUUID;
    this.#editor = editor;
    this.#sceneIsLoading = sceneIsLoading;
    // console.log(`MqttConnector.constructor fnished {this.#mqttTopic: ${this.#mqttTopic}, mqttTopic: ${mqttTopic}}`)
  }


  onConnect = () => {
    // Once a connection has been made, make a subscription and send a message.
    console.log("MQTT Connected. Topic: "+this.#mqttTopic);
    this.mqttConnectionStatus.status = true;
    //mqtt.subscribe("sensor1");

    const messageObj = {
      user: {
        id:  this.#wordpressUser.id,
        name: this.#wordpressUser.name,
        instance: this.#instanceUUID
      },
      message: "userConnected",          
    }
    const message = new Paho.MQTT.Message(JSON.stringify(messageObj));
    message.destinationName = this.#mqttTopic;
    this.#mqtt.send(message);
    console.log("Connected and sent message to Topic "+this.#mqttTopic);

    this.#mqtt.subscribe(this.#mqttTopic);

  }

  MQTTconnect = () => {
    fetch(
      `/wp-json/wp/v2/users/me?_wpnonce=${parent.POST_SUBMITTER.nonce}`
    )
    .then(wpUserResult => wpUserResult.json())
    .then(wpUserData => {
      console.log("wpUserData", wpUserData);
      this.#wordpressUser = wpUserData;
      // after wpUserData is loaded, connect
      console.log("Connecting to MQTT host "+ this.#mqttHost +" "+ this.#mqttPort+ ", on topic: "+this.#mqttTopic);
      
      var x=Math.floor(Math.random() * 10000); 
      const cname="orderform-"+x;
      this.#mqtt = new Paho.MQTT.Client(this.#mqttHost,this.#mqttPort,cname);

      var options = {
        timeout: this.#mqttReconnectTimeout,
        onSuccess: this.onConnect,
        useSSL: true,
        userName: "SUM24USER",
        password: "SummerSession"
      };

      //console.log(this.onMessageArrived);
      this.#mqtt.onMessageArrived = this.onMessageArrived;
      this.#mqtt.onConnectionLost = this.onConnectionLost;
      this.#mqtt.connect(options);
    });
    
    //connect
  }

  onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0){
      console.log("onConnectionLost:"+responseObject.errorMessage);
      this.mqttConnectionStatus.status = false;
    }
  };



  sendMqttMessage = (messageStr, content) => {
    // console.log("is mqtt connected", this.#mqtt);

    if(this.#mqtt){
      // console.log("Send "+messageStr);
      const messageObj = {
        user: {
          id:  this.#wordpressUser.id,
          name: this.#wordpressUser.name,
          instance: this.#instanceUUID
        },
        message: messageStr ,
        content: content
      }
      const message = new Paho.MQTT.Message(JSON.stringify(messageObj));
      message.destinationName = this.#mqttTopic;
      const messageSent = this.#mqtt.send(message);
    }else{
      console.log("MQTT websockets was not connected, no message sent ");
    }
  }

  onMessageArrived = async (msg) => {
    //console.log('MqttConnector.onMessageArrived ', this.#mqttTopic, msg.destinationName, this);
    if (msg.destinationName == this.#mqttTopic){
      // console.log("Topic wordverse: ", msg.payloadString);
      const arrMessageObj = JSON.parse(msg.payloadString);
      // console.log("arrMessageObj", arrMessageObj);
      
      // ignore all messages sent by this instance
      if( arrMessageObj.user.instance == this.#instanceUUID ){
        return
      }

      if(arrMessageObj.message === 'userConnected'){
        console.log(`New user connected; ${arrMessageObj.user.name} (${arrMessageObj.user.id})`);
        console.log("sceneToJson()",sceneToJson());
        this.sendMqttMessage(
          "sceneLiveUpdate",
          {
            targetInstance: arrMessageObj.user.instance,
            sceneData: sceneToJson()
          }
        )
        // add user avatar
        var avatarInstance = this.#editor.objectByUuid(arrMessageObj.user.instance);
        if(!avatarInstance){
          await addAvatarToScene(
            363, 
            arrMessageObj.user, 
            this.#editor
          );
          const newPosition = new THREE.Vector3( 
            100, 
            100, 
            100 
          );
          avatarInstance = this.#editor.objectByUuid(arrMessageObj.user.instance)
          const commandPositionInstance  = new SetPositionCommand( 
            this.#editor, avatarInstance, newPosition,  avatarInstance.position
          );
          this.#editor.execute(commandPositionInstance, "Set Avatar Position" );
        }
      }else if(arrMessageObj.message === 'userDisconnected'){
        console.log(`User Disconnected; ${arrMessageObj.user.name} (${arrMessageObj.user.id})`);
        const avatarObj = this.#editor.objectByUuid(arrMessageObj.user.instance);
        this.#editor.removeObject(avatarObj);
      }else if(arrMessageObj.message === 'updateAvatar'){
        console.log('UPDATEAVATAR');
        var avatarInstance = this.#editor.objectByUuid(arrMessageObj.user.instance);
        if(avatarInstance){
          const newPosition = new THREE.Vector3( 
            arrMessageObj.content.position.x, 
            arrMessageObj.content.position.y, 
            arrMessageObj.content.position.z 
          );
          // console.log("model.rotation", model.rotation);
          const newRotation = new THREE.Euler( 
            arrMessageObj.content.rotation._x, 
            arrMessageObj.content.rotation._y, 
            arrMessageObj.content.rotation._z 
          );
          const commandPositionInstance  = new SetPositionCommand( 
            this.#editor, avatarInstance, newPosition,  avatarInstance.position
          );
          this.#editor.execute(commandPositionInstance, "Set Avatar Position" );

          const commandRotationInstance  = new SetRotationCommand( 
            this.#editor, avatarInstance, newRotation,  avatarInstance.rotation
          );
          this.#editor.execute(commandRotationInstance, "Set Avatar Rotation" );
        }
      }else if(
        arrMessageObj.message === 'sceneLiveUpdate' && 
        arrMessageObj.content.targetInstance === this.#instanceUUID
      ){
        console.log('sceneLiveUpdate', arrMessageObj.content.sceneData, arrMessageObj.content.sceneData);
        this.#sceneIsLoading.state = 3;

        arrMessageObj.content.sceneData.vrModels.map(async model => {
          var modelInstance = this.#editor.objectByUuid(model.uuid);
          if(!modelInstance){
            //model exists, set meta props
            await addWpModelToScene(model.vrmodel, model.uuid, this.#editor);
            modelInstance = this.#editor.objectByUuid(model.uuid);
          }
          
          // console.log("model.position", model.position);
          const newPosition = new THREE.Vector3( 
            model.position.x, 
            model.position.y, 
            model.position.z 
          );

          // console.log("model.rotation", model.rotation);
          const newRotation = new THREE.Euler( 
            model.rotation.x, 
            model.rotation.y, 
            model.rotation.z 
          );

          // console.log("model.rotation", model.rotation);
          const newScale = new THREE.Vector3( 
            model.scale.x, 
            model.scale.y, 
            model.scale.z 
          );

          const commandPositionInstance  = new SetPositionCommand( this.#editor, modelInstance, newPosition,  modelInstance.position);
          try {
            this.#editor.execute(commandPositionInstance, "Set Position (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandRotationInstance  = new SetRotationCommand( this.#editor, modelInstance, newRotation,  modelInstance.rotation);
          try {
            this.#editor.execute(commandRotationInstance, "Set Rotation (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandScaleInstance = new SetScaleCommand( this.#editor, modelInstance, newScale,  modelInstance.scale);
          try {
            this.#editor.execute(commandScaleInstance, "Set Scale (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          // Apply texture fields from scene sync
          if (model.imageTexture || model.texture) {
            this.onMessageArrived({ destinationName: this.#mqttTopic, payloadString: JSON.stringify({
              user: arrMessageObj.user,
              message: 'setObjectTexture',
              content: { uuid: model.uuid, imageTexture: model.imageTexture || '', texture: model.texture || '', videoTexture: model.videoTexture || '' }
            }) });
          }
        });
        arrMessageObj.content.sceneData.primitives.map(async subject => {
          var subjectInstance = this.#editor.objectByUuid(subject.uuid);
          if(!subjectInstance){
            //subject exists, set meta props  
            await addWpPrimitiveToScene(subject.name, subject.uuid, this.#editor);
            subjectInstance = this.#editor.objectByUuid(subject.uuid);
          }
          
          // console.log("subject.position", subject.position);
          const newPosition = new THREE.Vector3( 
            subject.position.x, 
            subject.position.y, 
            subject.position.z 
          );

          // console.log("subject.rotation", subject.rotation);
          const newRotation = new THREE.Euler( 
            subject.rotation.x, 
            subject.rotation.y, 
            subject.rotation.z 
          );

          // console.log("subject.rotation", subject.rotation);
          const newScale = new THREE.Vector3( 
            subject.scale.x, 
            subject.scale.y, 
            subject.scale.z 
          );

          const commandPositionInstance  = new SetPositionCommand( this.#editor, subjectInstance, newPosition,  subjectInstance.position);
          try {
            this.#editor.execute(commandPositionInstance, "Set Position (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandRotationInstance  = new SetRotationCommand( this.#editor, subjectInstance, newRotation,  subjectInstance.rotation);
          try {
            this.#editor.execute(commandRotationInstance, "Set Rotation (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandScaleInstance = new SetScaleCommand( this.#editor, subjectInstance, newScale,  subjectInstance.scale);
          try {
            this.#editor.execute(commandScaleInstance, "Set Scale (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }

        });
        arrMessageObj.content.sceneData.lights.map(async subject => {
          var subjectInstance = this.#editor.objectByUuid(subject.uuid);
          if(!subjectInstance){
            //subject exists, set meta props  
            await addWpLightToScene(subject.name, subject.uuid, this.#editor);
            subjectInstance = this.#editor.objectByUuid(subject.uuid);
          }
          
          // console.log("subject.position", subject.position);
          const newPosition = new THREE.Vector3( 
            subject.position.x, 
            subject.position.y, 
            subject.position.z 
          );

          // console.log("subject.rotation", subject.rotation);
          const newRotation = new THREE.Euler( 
            subject.rotation.x, 
            subject.rotation.y, 
            subject.rotation.z 
          );

          // console.log("subject.rotation", subject.rotation);
          const newScale = new THREE.Vector3( 
            subject.scale.x, 
            subject.scale.y, 
            subject.scale.z 
          );

          const commandPositionInstance  = new SetPositionCommand( this.#editor, subjectInstance, newPosition,  subjectInstance.position);
          try {
            this.#editor.execute(commandPositionInstance, "Set Position (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandRotationInstance  = new SetRotationCommand( this.#editor, subjectInstance, newRotation,  subjectInstance.rotation);
          try {
            this.#editor.execute(commandRotationInstance, "Set Rotation (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
          const commandScaleInstance = new SetScaleCommand( this.#editor, subjectInstance, newScale,  subjectInstance.scale);
          try {
            this.#editor.execute(commandScaleInstance, "Set Scale (remote Scene Update)" );
          }
          catch (err){
            console.log(err);
          }
        });

          
        // add user avatar
        var avatarInstance = this.#editor.objectByUuid(arrMessageObj.user.instance);
        if(!avatarInstance){
          await addAvatarToScene(
            363, 
            arrMessageObj.user, 
            this.#editor
          );
          const newPosition = new THREE.Vector3( 
            100, 
            100, 
            100 
          );
          avatarInstance = this.#editor.objectByUuid(arrMessageObj.user.instance);
          if(avatarInstance){
            const commandPositionInstance  = new SetPositionCommand( 
              this.#editor, avatarInstance, newPosition,  avatarInstance.position
            );
            this.#editor.execute(commandPositionInstance, "Set Avatar Position offscreen" );
          }
        }

        editor.history.clear();
        document.getElementById('splash').classList.add('hidden');
      }else if(arrMessageObj.message === 'removeObject' && this.#editor.objectByUuid(arrMessageObj.content.uuid)){
        this.#editor.removeObject(this.#editor.objectByUuid(arrMessageObj.content.uuid));
      }else if(arrMessageObj.message === 'setObjectTexture'){
        const subjectObject = this.#editor.objectByUuid(arrMessageObj.content.uuid);
        if (subjectObject) {
          if (arrMessageObj.content.imageTexture) {
            subjectObject.userData.imageTexture = arrMessageObj.content.imageTexture;
            subjectObject.userData.texture = '';
            fetch('/wp-json/wp/v2/media/' + arrMessageObj.content.imageTexture)
              .then(function(r) { return r.json(); })
              .then(function(mediaData) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.scale(1, -1);
                  ctx.translate(0, -img.height);
                  ctx.drawImage(img, 0, 0);
                  const tex = new THREE.CanvasTexture(canvas);
                  tex.needsUpdate = true;
                  subjectObject.traverse(function(child) {
                    if (child.isMesh) {
                      const mats = Array.isArray(child.material) ? child.material : [child.material];
                      mats.forEach(function(mat) {
                        const m = mat.clone();
                        m.map = tex;
                        m.needsUpdate = true;
                        child.material = m;
                      });
                    }
                  });
                };
                img.src = mediaData.source_url;
              })
              .catch(function(err) { console.error('setObjectTexture (remote): image fetch failed', err); });
          } else if (arrMessageObj.content.texture) {
            subjectObject.userData.texture = arrMessageObj.content.texture;
            subjectObject.userData.imageTexture = '';
            // Use explicit videoTexture; otherwise extract it from the hydra code
            var _rvm = !arrMessageObj.content.videoTexture && textureCode
              ? textureCode.match(/initVideo\(\s*["']([^"']+)["']\s*\)/)
              : null;
            subjectObject.userData.videoTexture = arrMessageObj.content.videoTexture
              || (_rvm ? _rvm[1] : '');
            const textureCode = arrMessageObj.content.texture;
            (async function() {
              try {
                const hydraCanvas = document.createElement('canvas');
                hydraCanvas.width = 1024;
                hydraCanvas.height = 1024;
                hydraCanvas.style.cssText = 'position:absolute;right:-2048px;bottom:0;z-index:-1;pointer-events:none;';
                document.body.appendChild(hydraCanvas);
                if (!window.Hydra) {
                  if (!window._hydraSynthLoading) {
                    window._hydraSynthLoading = new Promise(function(resolve, reject) {
                      const s = document.createElement('script');
                      s.src = 'https://unpkg.com/hydra-synth/dist/hydra-synth.js';
                      s.onload = resolve; s.onerror = reject;
                      document.head.appendChild(s);
                    });
                  }
                  await window._hydraSynthLoading;
                }
                const hydraInstance = new window.Hydra({ detectAudio: false, makeGlobal: false, canvas: hydraCanvas });
                await new Promise(function(r) { setTimeout(r, 150); });
                textureCode.split(/\r?\n/).filter(function(l) { return l.trim(); }).forEach(function(line) {
                  try { eval('hydraInstance.synth.' + line.trim()); } // eslint-disable-line no-eval
                  catch(e) { console.warn('Hydra eval (remote):', line, e); }
                });
                const tex = new THREE.CanvasTexture(hydraCanvas);
                tex.needsUpdate = true;
                subjectObject.traverse(function(child) {
                  if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({ map: tex });
                  }
                });
                (function loop() { tex.needsUpdate = true; requestAnimationFrame(loop); })();
              } catch(err) {
                console.error('setObjectTexture (remote): Hydra setup failed', err);
              }
            })();
          } else {
            // texture cleared — restore default material
            subjectObject.userData.imageTexture = '';
            subjectObject.userData.texture = '';
            subjectObject.userData.videoTexture = '';
            subjectObject.traverse(function(child) {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial();
              }
            });
          }
        }
      }else if(arrMessageObj.message === 'setObjectPosition'){
        const subjectObject = this.#editor.objectByUuid(arrMessageObj.content.uuid);
        const newPosition = new THREE.Vector3( arrMessageObj.content.newPosition.x, arrMessageObj.content.newPosition.y, arrMessageObj.content.newPosition.z );
        const commandInstance  = new SetPositionCommand( this.#editor, subjectObject, newPosition,  subjectObject.position);
        try {
          this.#editor.execute(commandInstance, "Set Position (remote edit)" );
        }
        catch (err){
          console.log(err);
        }
      }else if(arrMessageObj.message === 'setObjectRotation'){
        const subjectObject = this.#editor.objectByUuid(arrMessageObj.content.uuid);
        const newRotation = new THREE.Euler( arrMessageObj.content.newRotation._x, arrMessageObj.content.newRotation._y, arrMessageObj.content.newRotation._z, arrMessageObj.content.newRotation._order );
        const commandInstance  = new SetRotationCommand( this.#editor, subjectObject, newRotation,  subjectObject.rotation);
        try {
          this.#editor.execute(commandInstance, "Set Rotation (remote edit)" );
        }
        catch (err){
          console.log(err);
        }
      }else if(arrMessageObj.message === 'setObjectScale'){
        const subjectObject = this.#editor.objectByUuid(arrMessageObj.content.uuid);
        const newScale = new THREE.Vector3( arrMessageObj.content.newScale.x, arrMessageObj.content.newScale.y, arrMessageObj.content.newScale.z );
        const commandInstance  = new Command( this.#editor, subjectObject, newScale,  subjectObject.scale);
        try {
          this.#editor.execute(commandInstance, "Set Scale (remote edit)" );
        }
        catch (err){
          console.log(err);
        }
      }else if(arrMessageObj.message === 'addPrimitive' && !this.#editor.objectByUuid(arrMessageObj.content.uuid)){
        if(arrMessageObj.content.type==="Box"){

          const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Capsule"){

          const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
          const material = new THREE.MeshStandardMaterial();
          const mesh = new THREE.Mesh( geometry, material );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Circle"){

          const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Cylinder"){

          const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Dodecahedron"){

          const geometry = new THREE.DodecahedronGeometry( 1, 0 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Icosahedron"){

          const geometry = new THREE.IcosahedronGeometry( 1, 0 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Octahedron"){

          const geometry = new THREE.OctahedronGeometry( 1, 0 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        
        }else if(arrMessageObj.content.type==="Ring"){

          const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Plane"){

          const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Sphere"){

          const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Sprite"){

          const mesh = new THREE.Sprite( new THREE.SpriteMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Tetrahedron"){

          const geometry = new THREE.TetrahedronGeometry( 1, 0 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Torus"){

          const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="TorusKnot"){

          const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="Tube"){

          const path = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( 2, 2, - 2 ),
            new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
            new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
            new THREE.Vector3( - 2, 2, 2 )
          ] );
      
          const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
          const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
          mesh.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, mesh, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else{
          console.log(`No action taken for MQTT message "${arrMessageObj.message}"`, arrMessageObj);
        }
      }else if(arrMessageObj.message === 'addLight' && !this.#editor.objectByUuid(arrMessageObj.content.uuid)){
        if(arrMessageObj.content.type==="AmbientLight"){

          const color = 0x222222;
          const light = new THREE.AmbientLight( color );
          light.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, light, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="DirectionalLight"){

          const color = 0xffffff;
          const intensity = 1;

          const light = new THREE.DirectionalLight( color, intensity );

          light.position.set( 5, 10, 7.5 );
          light.name = arrMessageObj.content.name;
          light.target.name = 'DirectionalLight Target';
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, light, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="HemisphereLight"){

          const skyColor = 0x00aaff;
          const groundColor = 0xffaa00;
          const intensity = 1;

          const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );

          light.position.set( 0, 10, 0 );

          light.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, light, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="PointLight"){


          const color = 0xffffff;
          const intensity = 1;
          const distance = 0;

          const light = new THREE.PointLight( color, intensity, distance );

          light.name = arrMessageObj.content.name;
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, light, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else if(arrMessageObj.content.type==="SpotLight"){

          const color = 0xffffff;
          const intensity = 1;
          const distance = 0;
          const angle = Math.PI * 0.1;
          const penumbra = 0;

          const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
          light.target.name = 'SpotLight Target';

          light.name = arrMessageObj.content.name;
          light.position.set( 5, 10, 7.5 );
          
          try {
            this.#editor.execute( new AddObjectAndSetMetaCommand( this.#editor, light, {uuid:arrMessageObj.content.uuid, name:arrMessageObj.content.type} ) );
          }
          catch (err){
            console.log(err);
          }

        }else{
          console.log(`No action taken for MQTT message "${arrMessageObj.message}"`, arrMessageObj);
        }
      }else if(arrMessageObj.message === 'addModel' && !this.#editor.objectByUuid(arrMessageObj.content.uuid)){
        // shared with the local "add model" flow so both sides load the model identically
        addWpModelToScene( arrMessageObj.content.modelId, arrMessageObj.content.uuid, this.#editor );
      }else{
        console.log(`No action implemented for MQTT message "${arrMessageObj.message}"`, arrMessageObj);
      }
    }
  }



}

export { MqttConnector };