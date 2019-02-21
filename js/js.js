var OSX=0,OSY=0,OSZ=0,MIindex=0;
var scene=new THREE.Scene(),camera,light,light2,canvas,sky,sky,controls=0;
var div = document.getElementById("mycan");
var audios = document.getElementById("djmusic").getElementsByTagName("audio");
var canvasW=document.body.clientWidth,canvasH=document.body.clientHeight;
var Music=true;
var gameData = {
    status : 6,
    start : 0,
    run : 1,
    out : 2,
    end : 3,
    crash :4,
    carryOut:5,
    loading:6,
    transition:7
};
canvas = new THREE.WebGLRenderer({antialias:true});
canvas.setSize(canvasW,canvasH);
canvas.setClearColor(0x11abde,1.0);
div.appendChild(canvas.domElement);
init();
function init(){
    camera = new THREE.PerspectiveCamera(50,canvasW/canvasH,1,5000);
    camera.position.set(0,34,-119);
    light = new THREE.AmbientLight(0xffffff);
    light2=new THREE.PointLight(0xededed);
    light2.position.set(0,550,0);
    scene.add(light2);
};
window.onresize=function(){
    canvasW=document.body.clientWidth,canvasH=document.body.clientHeight;
    var x=camera.position.x;
    var y=camera.position.y;
    var z=camera.position.z;
    canvas.setSize(canvasW,canvasH);

    if(gameData.status==10 || gameData.status==6){
        camera = new THREE.PerspectiveCamera(50,canvasW/canvasH,1,5000);
        camera.position.set(x,y,z);
        camera.lookAt(scene.position);
        if(controls!=0){
            controls = new THREE.OrbitControls(camera);
        }
    }else{
        
        camera = new THREE.PerspectiveCamera(125,canvasW/canvasH,1,35000);
        camera.position.set(x,y,z);
    };

};
var material=0;
function skyload(px,py,pz,nx,ny,nz,x,y,z){
    var path = "img/";
    var format = ".jpg";
    var m;
    var urls = [
        path+px+format,path+nx+format,
        path+py+format,path+ny+format,
        path+pz+format,path+nz+format
    ];
    var textureCube = THREE.ImageUtils.loadTextureCube(urls);
    var skyBox = THREE.ShaderLib["cube"];
    skyBox.uniforms["tCube"].value=textureCube;
    material = new THREE.ShaderMaterial({
            fragmentShader:skyBox.fragmentShader,
            vertexShader:skyBox.vertexShader,
            uniforms:skyBox.uniforms,
            depthWrite:skyBox.false,
            side:THREE.BackSide
        });
    m=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),material);
    return m;
};
sky=skyload("2","2","2","2","1","2",1364*2,300,701*2);
var mapspeed=50;
var A=-72000;
var map=new Array(14);
var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
    }
};
var onError = function ( xhr ) { };
var mtlLoader = new THREE.MTLLoader();
function mapload(){
    mtlLoader.setBaseUrl( 'sky/' );
    mtlLoader.setPath( 'sky/' );
    mtlLoader.load( 'map.mtl', function( materials ) {
        materials.preload();
        var Maps = new THREE.OBJLoader();
        Maps.setMaterials( materials );
        Maps.setPath( 'sky/' );
        Maps.load( 'map.obj', function ( object ) {
           for(var x=0; x<map.length; x++){
                
                map[x]=object.clone();
                A=A+19000;
                map[x].scale.set(100,130,100)
                if(x==7){
                    A=-53000;
                };
                map[x].position.set(A,-5608-1500,-15000);
                if(x>6){
                    map[x].position.set(A,-5608-1500,-44000);
                };
                if(x==map.length-1)Aircraftloading();
                OSY=OSY+2;
                
           }; 
        });
    });
}
//地图移动
function mapMobile(){
    for(var i=0; i<map.length; i++){
        map[i].position.z=map[i].position.z+mapspeed;
        if(map[i].position.z>15500){
            map[i].position.z=-43000;
        };
    };
};

//通用构造器
function Common(m){
    this.direction=0;
    this.r=(1/180*Math.PI)*1.5;
    this.time=0;
    this.blastT=0;
    this.deletes = true;
    this.b=true;
    this.index=0;
    this.scenes = function (){scene.add(m);};
    this.Mapcollision = function (){
       for(var i=0; i<this.fbb.geometry.vertices.length; i++){
            var ys = this.fbb.geometry.vertices[i].clone();
            var bh = ys.applyMatrix4(this.fbb.matrix);
            var xl = bh.sub(this.fbb.position);
            var ray = new THREE.Raycaster(this.fbb.position.clone(), xl.clone().normalize());
            var collisionResults = ray.intersectObjects(this.MAP);
            if (collisionResults.length > 0 && collisionResults[0].distance < xl.length()) {
                if(m.position.z==0){
                    if(Music)MI.jieshu.play();
                    MI_BGM.pause();
                    gameData.status = gameData.crash;
                    scene.remove(this.blast.cloud);
                    this.blastS=true;
                    this.blast=0;
                    this.blastT=0;
                    this.blastIndex=0;
                    m.remove(camera);
                    camera.position.x=m.position.x;
                    camera.position.y=m.position.y;
                    camera.position.z=m.position.z;
                };
            };
        }; 
    };
    //飞机移动状态复位
    this.position2=function (){
    if(m.rotation.x>0 && this.direction!=1){
        m.rotation.x=m.rotation.x-this.r;
        if(m.rotation.x<=0){
            m.rotation.x=0;
        };
    }
    if(m.rotation.z<0 && this.direction!=2){
        m.rotation.z=m.rotation.z+this.r;
        m.rotation.y=m.rotation.y+this.r/4;

        if(m.position.z>=0){
            MI.aim_bgs.style.transform="rotate("+-m.rotation.z*20+"deg)";
            
        }
        if(m.rotation.z>=0){
            m.rotation.y=m.rotation.z=0;
             
            MI.aim_bgs.style.transform="rotate(0deg)";
        };
    };
    if(m.rotation.z>0 && this.direction!=4){
        m.rotation.z=m.rotation.z-this.r;
        m.rotation.y=m.rotation.y-this.r/4;
        if(m.position.z>=0){
            MI.aim_bgs.style.transform="rotate("+-(+m.rotation.z*20)+"deg)";
        }
        if(m.rotation.z<=0){
            m.rotation.y=m.rotation.z=0;
            MI.aim_bgs.style.transform="rotate(0deg)";
        };
    };
    if(m.rotation.x<0 && this.direction!=3){
        m.rotation.x=m.rotation.x+this.r;
        if(m.rotation.x>=0){
            m.rotation.x=0;

        };
    };
};
//飞机移动
this.position1=function(){
    if(this.direction==0){
            this.position2();
        };
        if(this.direction==1 && m.position.y<5000){
            this.position2();
            m.position.y=m.position.y+this.TB;
            if(m.position.z>=0){
                if(camera.position.z==28)camera.position.y=camera.position.y+this.TB;
                this.fbb.position.y=this.fbb.position.y+this.TB;
            }
            if(m.rotation.x<0.5){

                m.rotation.x=m.rotation.x+this.r;
            }
        }else if(this.direction==2 && m.position.x<27800){
            this.position2();
            m.position.x=m.position.x+this.LR;
            if(m.position.z>=0){
                if(camera.position.z==28)camera.position.x=camera.position.x+this.LR;
                this.fbb.position.x=this.fbb.position.x+this.LR;
                MI.aim_bgs.style.transform="rotate("+-(+m.rotation.z*20)+"deg)";
                
            }
            if(m.rotation.z>-1.1){
                m.rotation.z=m.rotation.z-this.r;
                m.rotation.y=m.rotation.y-this.r/4;
            }
        }else if(this.direction==3){
            this.position2();
            m.position.y=m.position.y-this.TB;
            if(m.position.z>=0){
                if(camera.position.z==28)camera.position.y=camera.position.y-this.TB;
                this.fbb.position.y=this.fbb.position.y-this.TB;
            }
            if(m.rotation.x>-0.6){
                m.rotation.x=m.rotation.x-this.r;
            }
        }else if(this.direction==4 &&  m.position.x>-29050){
            this.position2();
            m.position.x=m.position.x-this.LR;
            if(m.position.z>=0){
                if(camera.position.z==28)camera.position.x=camera.position.x-this.LR;
                this.fbb.position.x=this.fbb.position.x-this.LR;
                MI.aim_bgs.style.transform="rotate("+-m.rotation.z*20+"deg)";
            }
            if(m.rotation.z<1.1){
                m.rotation.z=m.rotation.z+this.r;
                m.rotation.y=m.rotation.y+this.r/4;
            }
        };
    };
    //爆炸烟雾
    this.blast=0;
    this.blastS=true;
    this.blastIndex=0;
    this.blastFun=function (max,min,t){
        if(this.blast==0){
            var WY={
                psys:0,
                cloud: new THREE.Object3D(),
                x:m.position.x,
                y:m.position.y,
                z:m.position.z,
                max:max,
                min:min,
                vz:0,
                img:"img/blast.png",
                rate:10,
                rum:15
            };
            if(m.position.z==0){this.blast=new wys(WY)}
            else{this.blast=new wy(WY)};
        }else{
            this.blastT++;
            if(this.blast.psys && this.blastT<60){
                this.blast.psys.update(t);
            };
            if(m.position.z<0)this.blast.cloud.position.z+=30;
            if(this.blastT>60){
                if(gameData.status!=gameData.crash){
                    if((this.blastT-60)%10==0 && this.blastIndex<this.blast.cloud.children.length){
                        this.blast.cloud.children[this.blastIndex].visible=false;
                        this.blastIndex++;
                    };
                }else{
                    if((this.blastT-60)%20==0 && this.blastIndex<this.blast.cloud.children.length){
                        this.blast.cloud.children[this.blastIndex].visible=false;
                        this.blastIndex++;
                    };
                };
                if(this.blastIndex>this.blast.cloud.children.length-1){
                    this.blastT=0;
                    this.blastIndex=0;
                    scene.remove(this.blast.cloud);
                    this.blastS=false;
                    this.blast.cloud.position.z=m.position.z;
                };
            };
        };
    };
    
};
//各烟雾初始化
var wy1;
var wy2;
function wy(m){
    THREE.ImageUtils.loadTexture( m.img, undefined,function particlesLoaded(mapA) {
    m.cloud.position.z=m.z;
    m.cloud.position.y=m.y;
    m.cloud.position.x=m.x;
    m.psys = new SpriteParticleSystem({
      cloud:m.cloud,
      rate:m.rate,
      num:m.rum,
      texture:mapA,
      scaleR:[m.max,m.min],
      speedR:[0,0],
      
      lifespanR:[5,5],
      terminalSpeed:20
    });
    m.psys.addForce(new THREE.Vector3(0,0,m.vz));
    m.psys.start();
});
return m;
};
function wys(m){
    THREE.ImageUtils.loadTexture( m.img, undefined,function particlesLoaded(mapA) {
    m.cloud.position.z=m.z;
    m.cloud.position.y=m.y;
    m.cloud.position.x=m.x;
    m.psys = new SpriteParticleSystem({
      cloud:m.cloud,
      rate:6,
      num:10,
      texture:mapA,
      scaleR:[m.max,m.min],
      speedR:[8,8],
      
      lifespanR:[5,5],
      terminalSpeed:20
    });
    m.psys.addForce(new THREE.Vector3(0,0,m.vz));
    m.psys.start();
});
return m;
};
function WYFun(x,y,z,max,min,vz,img){
    var WYs1={
        psys:0,
        cloud: new THREE.Object3D(),
        x:-x,
        y:y,
        z:z,
        max:max,
        min:min,
        vz:vz,
        img:img,
        rate:8,
        rum:25
    };
    var WYs2={
        psys:0,
        cloud: new THREE.Object3D(),
        x:x,
        y:y,
        z:z,
        max:max,
        min:min,
        vz:vz,
        img:img,
        rate:8,
        rum:25
    };
    wy1=new wy(WYs1);
    wy2=new wy(WYs2);
};
//我方飞机
//我方飞机构造
var ffx = new THREE.BoxGeometry(140,140,135);
var ffn = new THREE.MeshLambertMaterial({color:0xff0000,opacity:0});
function DJMapcollision(m,n){
    var x=m.position.x;
    var y=m.position.y;
    var z=m.position.z;
    var a=0;
    for(var i=0; i<DJ.length; i++){
        var djx = DJ[i][0].body.position.x-DJ[i][0].x;
        var djy = DJ[i][0].body.position.y-DJ[i][0].y;
        if((x>djx && x<djx+DJ[i][0].x*2) && (y>djy && y<djy+DJ[i][0].y*3)){
               if(z!=0){
                    if(z<DJ[i][0].body.position.z+350 && z>DJ[i][0].body.position.z-350){
                        a++;
                        shotDJ=i;
                    }else{a=0;}
                }else{a++;
                    MI.aimIndex=i;
                    if(DJ[i][0].missiles.emission==false){}DJ[i][0].index=0;
                };
               MISSILE[0].dj=MISSILE[1].dj=i;
        };
    };
    return a;
};

function MIaircraft(m){
    Common.call(this,m);
    this.mi=m;
    this.life=3;
    this.score=24;
    this.dt=0.05;
    this.aimIndex=-1;
    this.MZ=document.getElementById("MZ");
    this.aim_bgs=document.getElementById("aim_bgs");
    this.zhongdan=document.getElementById("zhongdan");
    this.jieshu=document.getElementById("jieshu");
    this.fashe=document.getElementById("fashe").getElementsByTagName("audio");
    this.MAP=[];
    this.aim_p = document.getElementById("aim_a");
    this.aim_a = document.getElementById("aim_p");
    this.aim_R=0;
    this.aim_bg=document.getElementById("aim_bg");
    this.remindDIV=document.getElementById("remind");
    this.remaining=document.getElementById("remaining");
    this.fbb= new THREE.Mesh(ffx,ffn);
    this.fbb.position.z=0;
    this.fbb.position.y=44;
    this.fbb.visible=false;
    scene.add(this.fbb);
    this.LR = 55;
    this.TB = 40;
    this.mp3 = audios[0];
    this.remindTime=0;
    this.remind=function (){
        
        if(this.remindTime>0){
           if(this.remindTime%20==0){
              if(this.remindDIV.style.display=="none" || this.remindDIV.style.display==""){
                this.remindDIV.style.display="block";
              }else{
                this.remindDIV.style.display="none";
              };
           }; 
           this.remindTime++;
           if(this.remindTime>120)this.remindTime=0;
        };
    };
    this.camera=function (z,y){
       if(camera.position.z==28){
            camera = new THREE.PerspectiveCamera(110,canvasW/canvasH,1,200000);
            m.add(camera);

            camera.position.z=-z;
            camera.position.y=y;
            camera.position.x=0;
        }else{
            camera = new THREE.PerspectiveCamera(125,canvasW/canvasH,1,35000);
            m.remove(camera);

            camera.position.z=28;
            camera.position.y=m.position.y+32;
            camera.position.x=m.position.x;
        };
    };
    this.bs = function (){
        this.remindDIV.style.display="none";
        document.getElementById("aim").style.display="none";
        document.getElementById("aim_bg").style.display="none";
        $("#aim,#aim_bg").css({"transform":"scale(4,4)"})
        if(camera.position.z<1300){
            camera.position.z=camera.position.z+(1300-camera.position.z)/60;
            camera.position.y=camera.position.y+(1300-camera.position.z)/80;
        };
        $("#mission").text("MISSION FIALED");
        $("#good").text("MAYBE YOU CAN SUCCEED NEXT TIME");
        $("#logo,#Fleft p, #Tright p,.game_bg1").fadeOut(800);
        $(".game_bg2").css("opacity","0.4");
        $(".game_bg2,.game_bg3").fadeIn(800,function (){
            if(OSX>1000){
                OSX=0;           
                crashAnimate();
            };
            if(time==false){
                t1++;

                if(t1%10==0)extratime();
            };
        });

        if(this.blastS){
            this.blastFun(8,0.03,0.02);
            this.blast.cloud.position.x=m.position.x;
            this.blast.cloud.position.z=m.position.z;
            this.blast.cloud.position.y=m.position.y;  
            scene.add(this.blast.cloud);
            scene.remove(m)
        };

    };
    this.aim = function (a){
        if (wy1.psys)
            wy1.psys.update(this.dt);

        if (wy2.psys)
          wy2.psys.update(this.dt);

        var a=DJMapcollision(m);
        if(a==0 && this.aim_p.clientWidth<70){
            MISSILE[0].emissions=false;
            MISSILE[1].emissions=false;
            MISSILE[2].emissions=false;
            this.aim_p.style.height=this.aim_p.clientHeight+4+"px";
            this.aim_p.style.width=this.aim_p.clientWidth+4+"px";
            this.aim_p.style.left=this.aim_p.offsetLeft-2+"px";
            this.aim_p.style.top=this.aim_p.offsetTop-2+"px";
            if(this.aim_p.clientWidth>25){
               this.aim_p.style.borderColor="#ffffff"; 
            };
        }
        if(a>0){
            MISSILE[0].emissions=true;
            MISSILE[1].emissions=true;
            MISSILE[2].emissions=true;
            if(this.aim_p.clientWidth>22){
                if(Music)if(Music)this.MZ.play();
                this.aim_p.style.width=this.aim_p.clientWidth-4+"px";
                this.aim_p.style.height=this.aim_p.clientHeight-4+"px";
                this.aim_p.style.left=this.aim_p.offsetLeft+2+"px";
                this.aim_p.style.top=this.aim_p.offsetTop+2+"px";
                if(this.aim_p.clientWidth==22){
                    this.aim_p.style.borderColor="#ffe842";
                };
            };
        };
        this.aim_R++;
        this.aim_a.style.transform="rotate("+this.aim_R+"deg)"        
    };
    this.maps_1=function (p,a,b,c,z){
            if(z>-15000 && z<-4850){
                this.MAP[0]=map[p].children[a];
                //map[p].children[a].visible=false;
            }else if(z>-4850 && z<5200){
                this.MAP[0]=map[p].children[b];
                //map[p].children[b].visible=false;
            }else if(z>5200){
                this.MAP[0]=map[p].children[c];
                //map[p].children[c].visible=false;
            }else if(z>-43000  && z<-34275){
                this.MAP[0]=map[p+7].children[a];
                //map[p+7].children[a].visible=false;
            }else if(z>-34275 && z<-24062){
                this.MAP[0]=map[p+7].children[b];
                //map[p+7].children[b].visible=false;
            }else if(z>-24062 && z<-14000){
                this.MAP[0]=map[p+7].children[c];
                //map[p+7].children[c].visible=false;
            };
    };
    this.maps = function (){
        var z=map[0].position.z;
        if(m.position.x>-29050 && m.position.x<-19360){
            this.maps_1(2,4,0,2,z);
        }else if(m.position.x>-19400 && m.position.x<-9950){
            this.maps_1(2,5,3,1,z);
        }else if(m.position.x>-9950 && m.position.x<-350){
            this.maps_1(3,4,0,2,z);
        }else if(m.position.x>-350 && m.position.x<8900){

            this.maps_1(3,5,3,1,z);
        }else if(m.position.x>8900 && m.position.x<18550){
            this.maps_1(4,4,0,2,z);
        }else if(m.position.x>18550 && m.position.x<27720){
            this.maps_1(4,5,3,1,z);
        };
    };
    this.blastAnimate=function (){
        if(this.blastS && gameData.status!=gameData.crash){
            this.blastFun(0.3,0.02,0.1);
            this.blast.cloud.position.x=m.position.x;
            this.blast.cloud.position.y=m.position.y;
            this.blast.cloud.position.z=this.blast.cloud.position.z+1;            
        };
    };
};
//我方飞机初始化
var MI=0;
var Aircrafts=[0,1,2];
var Aircraft=new Array(3);
Aircraft[0] = {
    obj : "FA-22_Raptor.obj",
    img : ["FA-22_Raptor.mtl","obj1-1.mtl","obj1-2.mtl"],
    scales : [0.55,0.55,0.32],
    posZ : 0
};
Aircraft[1] = {
    obj : "obj2.obj",
    img : ["obj2.mtl","obj2-1.mtl","obj2-2.mtl"],
    scales : [0.7,0.65,0.44],
    posZ : 0
};
Aircraft[2] = {
    obj : "obj3.obj",
    img : ["obj3.mtl","obj3-1.mtl","obj2-2.mtl"],
    scales : [0.65,0.65,0.45],
    posZ : 0
};

function Aircraftloading(){
    for(var i=0; i<Aircraft.length; i++){
        MiObj(Aircraft[i],0,i);
    };
};
function MiObj(m,x,i){
    var f22 = new THREE.MTLLoader();
    f22.setBaseUrl( 'moxing/' );
    f22.setPath( 'moxing/' );
    f22.load( m.img[x], function( materials ) {
            materials.preload();
            var fs = new THREE.OBJLoader();
            fs.setMaterials( materials );
            fs.setPath( 'moxing/' );
            fs.load( m.obj, function ( object ) {
            object.scale.set(m.scales[0],m.scales[1],m.scales[2]);
            object.position.set(0,-5,m.posZ);
            object.rotation.x=0;
            object.rotation.z=0;
            Aircrafts[i] = new MIaircraft(object);
            if(i==2)generateDJ();
            OSY=OSY+2;
        });
    });
};

//敌方导弹初始化
var Emissiles = {
    url : "moxing/daodan.js",
    scales : [1,1,0.7],
    posZ : -20000
};
var djEM=[];
var shotDJ=0;
var missiles = {
    url : "moxing/daodan.js",
    scales : [2,2,1.6],
    posZ : -20
};
var MISSILE= new Array(3);

//导弹烟雾构造
function yan(m,z,a,b){
      THREE.ImageUtils.loadTexture( "img/smoke.png", undefined,function particlesLoaded(mapA) {
        m.psys = new SpriteParticleSystem({
          cloud:m.cloud,
          rate:18,
          num:36,
          texture:mapA,
          scaleR:[0.1,2],
          speedR:[0,5],
          rspeedR:[-0.1,0.3],
          lifespanR:[a,b],
          terminalSpeed:20
        });
        m.psys.addForce(new THREE.Vector3(0,0,z));
        m.psys.start();
      });
      return m;
    };
//我方导弹

function MLoading(){
    var binaryLoader=new THREE.BinaryLoader();
    binaryLoader.load("moxing/daodan.js", function(geometry,material){
    var object = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
    var OBJ;
        for(var i=0; i<MISSILE.length; i++){
            OBJ=object.clone();
            OBJ.scale.set(2,2,1.6);
            OBJ.position.set(0,0,-20);
            MISSILE[i]=new mistructure(OBJ,500,3,4);
            MISSILE[i].missile.add(MISSILE[i].ms.cloud);
            OSY=OSY+2;
        };
        for(var i=0; i<DJ.length; i++){
            OBJ=object.clone();
            OBJ.scale.set(1,1,0.7);
            OBJ.position.set(0,0,-20000);
            djEM[i]=OBJ;
            OSY=OSY+2;
        }
  });
};
//导弹构造
function mistructure(m,z,a,b){
    this.missile = m;
    this.deletes = false;
    this.emission=false;
    this.emissions=false;
    this.djx=0;
    this.djy=0;
    this.dj=0;
    this.index=0;
    this.time=0;
    this.EMX=0;
    this.EMY=0;
    this.gapx;
    this.gapy;
    this.RX;
    this.RY;
    this.msx;
    this.msy;
    this.music=document.getElementById("daodanmusic");
    this.yanwu={
      psys:0,
      cloud: new THREE.Object3D()
    };
    this.ms=new yan(this.yanwu,z,a,b);
    this.Mapcollision=function (){
        var MIX=MI.mi.position.x;
        var MIY=MI.mi.position.y;
        var MIZ=MI.mi.position.z;
        if(m.position.x>MIX-1000 && m.position.x<MIX+1000){
            if(m.position.y>MIY-800 && m.position.y<MIY+800){
                if(m.position.z>MIZ-1000 && m.position.z<MIZ+1000){
                    if(Music)this.music.play();

                };
            };
        };
        if(m.position.x>MIX-30 && m.position.x<MIX+30){
            if(m.position.y>MIY-10 && m.position.y<MIY+20){
                if(m.position.z>MIZ-30 && m.position.z<MIZ+30){
                    MI.life--;
                    if(MI.life==0){
                        MI_BGM.pause();
                        if(Music)MI.jieshu.play();

                        gameData.status = gameData.crash;
                        scene.remove(MI.blast.cloud);
                        MI.blastS=true;
                        MI.blast=0;
                        MI.blastT=0;
                        MI.blastIndex=0;

                        scene.remove(m);
                        this.emission=false;
                        m.position.z=0;
                        m.rotation.y=-(1/180*Math.PI)*180;
                        m.rotation.x=0;

                        MI.mi.remove(camera);
                        camera.position.x=MI.mi.position.x;
                        camera.position.y=MI.mi.position.y+32;
                        camera.position.z=MI.mi.position.z+28;
                        
                    }else{
                        if(Music)MI.zhongdan.play();
                        MI.remindTime=1;
                        MI.remindDIV.style.display="none";
                        MI.blastFun(0.3,0.02,0.1);
                        MI.blast.cloud.position.z=-8;
                        scene.add(MI.blast.cloud);
                        MI.blastS=true;

                        scene.remove(m);
                        this.emission=false;
                        m.position.z=0;
                        m.rotation.y=-(1/180*Math.PI)*180;
                        m.rotation.x=0;
                    };

                };
            };
        };
    };
    this.DJMobile=function (){
        if(this.emission){
            scene.add(m);
            if (this.ms.psys)
            this.ms.psys.update(dt+0.01);

            if(m.position.z<1000){
                m.position.x+=this.EMX;
                m.position.y+=this.EMY;
                m.position.z+=50;
                
                this.Mapcollision();
            }else{
                scene.remove(m);
                this.emission=false;
                m.position.z=0;
                m.rotation.y=-(1/180*Math.PI)*180;
                m.rotation.x=0;
            };
        };
    };
    this.mobile = function (){

        if(this.emission){
            if (this.ms.psys)
            this.ms.psys.update(dt+0.01);
            var a=DJMapcollision(m);
            if(m.position.x>this.djx){
               m.position.x-=3; 
            }else{
               m.position.x+=3; 
            };

            if(m.position.y>this.djy+200){
               m.position.y-=3; 
            }else{
               m.position.y+=3; 
            };
            m.position.z-=75;
            
            if(a>0){
                this.deletes=true;
                DJ[shotDJ][0].deletes=false;
                DJ[shotDJ][0].life--;
                MI.score--;
                MI.remaining.innerHTML=MI.score;
            };
            if(m.position.z<-16000){
                this.deletes=true;
            };
            if(this.deletes){
                scene.remove(m);
                m.position.z=-20;
                this.emission=false;
                this.deletes=false;
            };

        };
    };
};
function emissionM2(){
    for(var i=0; i<DJ.length; i++){
        DJ[i][0].missiles.DJMobile();
    };
};
function missilEmobile(){
    for(var i=0; i<MISSILE.length; i++){
        MISSILE[i].mobile();
    };
};
//敌方飞机
var DJ=[
    [ ,-9600,false,-8800],
    [ ,-19000,false,-8800],
    [ ,-1000,true,-9500],
    [ ,17500,true,-9500],
    [ ,8600,true,-9500],
    [ ,-8000,false,-8800],
    [ ,8000,true,-9500],
    [ ,0,true,-8800],
];
function DJCommon(m,n){
    Common.call(this,m);
    this.LR = 60;
    this.TB = 40;
    this.trues=n;
    this.x=600;
    this.y=400;
    this.body=m;
    this.life=3;
    this.missiles=9;
    this.EMtime=500+Math.random()*400;
    this.posX = m.position.x;
    this.delete2=function (){

    };
    this.emissionMs =function (){

        this.missiles.index=((MI.mi.position.z)-(this.missiles.missile.position.z))/50;
        if(MI.mi.position.x>=this.missiles.missile.position.x){
            this.missiles.gapx=(MI.mi.position.x)-(this.missiles.missile.position.x);
            this.missiles.EMX=(this.missiles.gapx)/(this.missiles.index)
            if(this.index>this.EMtime){
                this.missiles.missile.rotation.y=this.missiles.missile.rotation.y+(1/180*Math.PI)*(this.missiles.gapx/200);
                
                
            }
        }else{
            this.missiles.gapx=(this.missiles.missile.position.x)-(MI.mi.position.x);
            this.missiles.EMX=-(this.missiles.gapx)/(this.missiles.index)
            if(this.index>this.EMtime){
                this.missiles.missile.rotation.y=this.missiles.missile.rotation.y-(1/180*Math.PI)*(this.missiles.gapx/200);
                

            }
        };
         if(MI.mi.position.y>=this.missiles.missile.position.y){
            this.missiles.gapy=(MI.mi.position.y+6)-(this.missiles.missile.position.y);
            this.missiles.EMY=(this.missiles.gapy)/(this.missiles.index)
            if(this.index>this.EMtime){
                this.missiles.missile.rotation.x=this.missiles.missile.rotation.x-(1/180*Math.PI)*(this.missiles.gapy/200);
              
            }
        }else{
            this.missiles.gapy=(this.missiles.missile.position.y)-(MI.mi.position.y+6);
            this.missiles.EMY=-(this.missiles.gapy)/(this.missiles.index)
            if(this.index>this.EMtime){
                this.missiles.missile.rotation.x=this.missiles.missile.rotation.x+(1/180*Math.PI)*(this.missiles.gapy/200);
               
            }
        };

    };
    this.emissionM=function (){
            
        this.index++;

        if(this.index>this.EMtime){
           
            this.missiles.missile.position.x=m.position.x;
            this.missiles.missile.position.y=m.position.y;
            this.missiles.missile.position.z=m.position.z;
            this.missiles.missile.visible=true;
            this.emissionMs();
            this.missiles.emission=true;
            this.index=0;
        };
    };
    this.emissionM3=function (){
        
        if(MI.mi.position.y>2300){

            if(this.index>this.EMtime){
                this.missiles.missile.position.x=m.position.x;
                this.missiles.missile.position.y=m.position.y;
                this.missiles.missile.position.z=m.position.z;
                this.missiles.missile.visible=true;
                this.emissionMs();
                this.missiles.emission=true;
                this.index=0;
            };
        }else{
            if(this.index%280==0 && this.missiles.emission==false){
                
                this.missiles.missile.position.x=m.position.x;
                this.missiles.missile.position.y=m.position.y;
                this.missiles.missile.position.z=m.position.z;
                this.missiles.missile.visible=true;
                this.emissionMs();
                this.missiles.emission=true;
                this.index=0;
            };
        }
        this.index+=1;
    };
    this.pos = function (){
        var x = map[0].position.z;
        var math = parseInt(Math.random()*10)%2;
            if(x>-8000 && x<-7900){
                if(this.trues){
                    this.direction=4;
                }else{
                    this.direction=2;
                };
            };
            if(x>-2100 && x<-2000){
                    this.direction=0;
            };
            if(x<12000 && x>11900){
                if(this.trues){
                    this.direction=2;
                }else{
                    this.direction=4;
                };
            };
            if(this.trues==false){
                if(x>-36000 && x<-35900){
                    if(this.trues){
                        this.direction=4;
                    }else {
                        this.direction=2;
                    }
                };
                if(x>-29700 && x<-29600){
                   
                        this.direction=0;
                    
                };
                if(x>-17000 && x<-16900){
                    if(this.trues){
                        this.direction=2;
                    }else{
                      this.direction=4;  
                    };
                };
            };
        if(this.direction==2 && this.trues){
            if(m.position.x>this.posX-60 && m.position.x<this.posX+60){
                this.direction=0;
            };
        };
        if(this.direction==4 && this.trues==false){
            if(m.position.x>this.posX-60 && m.position.x<this.posX+60){
                this.direction=0;
            };
        };
    };
};
function generateDJ(){
     var djindex=0;
     var diji=new THREE.BinaryLoader();
        diji.load('moxing/diji.js', function(geometry,material){
        material[0].side=THREE.DoubleSide;
        var object = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( material ) );
        object.scale.set(46,48,30);
        for(var m=0; m<DJ.length; m++){
            djindex=object.clone();
            if(DJ[m][2]){
                djindex.position.set(DJ[m][1],0,-10000);
            }else{
                djindex.position.set(DJ[m][1],300,-9300);
            };
            if(m>4){
                djindex.position.set(DJ[m][1],3000,-9300);
            };
            DJ[m][0] = new DJCommon(djindex,DJ[m][2]);
            DJ[m][0].blastFun(12,1,0.06);
            if(m==DJ.length-1)MLoading();
            OSY=OSY+2;
        };
    });          
};
var crash=0;
function DJs(){
    var a=DJMapcollision(MI.mi);
    for(var i=0; i<DJ.length; i++){
        if(DJ[i][0].b){
            DJ[i][0].position1();
            DJ[i][0].pos();
            if(i>4)DJ[i][0].emissionM();
            if(a>0 && i<5)DJ[MI.aimIndex][0].emissionM3();
            if(MI.mi.position.y>2300 && i<5)DJ[i][0].emissionM3();
            if(DJ[i][0].missiles.emission && DJ[i][0].missiles.missile.position.z<-1000)DJ[i][0].emissionMs();
            if(DJ[i][0].deletes==false){
               if(Music)audios[i].play();
               DJ[i][0].blast.cloud.position.z=DJ[i][0].body.position.z;
               DJ[i][0].blast.cloud.position.y=DJ[i][0].body.position.y;
               DJ[i][0].blast.cloud.position.x=DJ[i][0].body.position.x;
               DJ[i][0].blastS=true;
               scene.add(DJ[i][0].blast.cloud);
               DJ[i][0].body.visible=false;
               DJ[i][0].b=false;
               DJ[i][0].body.position.x=30000;
               DJ[i][0].body.position.y=-4000;
               
            };
        }else{
            if(DJ[i][0].blastS)DJ[i][0].blastFun(12,1,0.06);
            if(DJ[i][0].life>0){
                DJ[i][0].time++;
                if(DJ[i][0].time>1200 && DJ[i][0].deletes==false){
                    DJ[i][0].body.visible=true;
                    if(DJ[i][2]){
                        DJ[i][0].body.position.set(DJ[i][1],0,-16000);
                    }else{
                        DJ[i][0].body.position.set(DJ[i][1],300,-16000);
                    };
                    if(i>4){
                        DJ[i][0].body.position.set(-10000+Math.random()*20000,2000+Math.random()*2000,-16000);
                    };
                    DJ[i][0].deletes=true;
                };

                if(DJ[i][0].deletes && DJ[i][0].b==false){
                    if(DJ[i][0].body.position.z<DJ[i][3]){
                        DJ[i][0].body.position.z+=50;
                    }else{
                        DJ[i][0].b=true;
                        DJ[i][0].time=0;
                    };
                };
            };
        };
    };
};

//记时
var time =new Date();
var t1=0;
t1=time.getTime();
var t3;
function times(){
    if(MI.score==0){
        crash++;
       if(crash>250){
           MI.direction=0;
           outsmoke();
           crash=0;
           gameData.status=gameData.carryOut;
           MI_BGM.pause();
        };
        
    }else{
        var time2=new Date();
        t3=180-Math.floor((time2.getTime()-t1)/1000);
        var Minute=document.getElementById("Minute");
        var second=document.getElementById("second");
        Minute.innerHTML="0"+Math.floor(t3/60);
        second.innerHTML=Math.floor(t3%60);
        if(t3<=0){
            gameData.status=gameData.crash;
            MI.blastS=false;
            MI_BGM.pause();
            scene.remove(MI.blast.cloud);
        };
    };
};

var outSmoke =0;
function outsmoke(){
    var WY={
        psys:0,
        cloud: new THREE.Object3D(),
        x:0,
        y:0,
        z:0,
        max:0.01,
        min:2,
        vz:1000,
        img:"img/smoke.png",
        rate:30,
        rum:200
    };
    outSmoke=new wy(WY);
    
    MI.mi.remove(wy1.cloud)
    MI.mi.remove(wy2.cloud)
    MI.mi.add(outSmoke.cloud);
    outSmoke.cloud.position.z=20;
    outSmoke.cloud.position.y=18;
};

//任务完成
var carryOutY=0;
function carryOut(){
    $("#remind").css("display","none");
    if(MI.aim_bg.style.display!="none"){
       carryOutY=camera.position.y+1000;
       
       $("#aim,#aim_bg").fadeOut(600);
       $("#aim,#aim_bg").css("transform","scale(4,4)");

    }
    if(MI.aim_bg.style.display=="none"){
        if(Music && mapspeed>39)MI.jieshu.play();
        if(mapspeed>15)mapspeed-=0.5;
        if(MI.mi.scale.x<1){
            MI.mi.scale.x=MI.mi.scale.x+0.1;
            MI.mi.scale.y=MI.mi.scale.x+0.1;
            MI.mi.scale.z=MI.mi.scale.z+0.1;
        }
        MI.mi.position.z-=10;
        if(camera.position.y<carryOutY)camera.position.y+=(carryOutY-camera.position.y)/50;
        MI.mi.position.y+=15;
        if(MI.mi.rotation.x<1)MI.mi.rotation.x+=MI.r/1.5;

        if(outSmoke.psys)outSmoke.psys.update(dt);
        $("#mission").text("MISSION COMPLETED");
        $("#good").text("YOU ARE A GOOD PILOT");
        $("#good").css("letter-spacing","3px")
        $("#logo,#Fleft p, #Tright p,.game_bg1").fadeOut(800);
        $(".game_bg2").css("opacity","0.4");
        $(".game_bg2,.game_bg3").fadeIn(800,function (){
            if(OSX>1000){
                OSX=0;           
                crashAnimate();
            };
            if(time==false){
                t1++;

                if(t1%10==0)extratime();
            };
        });
    }

};
//监听键盘
function missleStart(i){
    scene.add(MISSILE[i].missile);
    MISSILE[i].emission=true;
    MISSILE[i].missile.position.x=MI.mi.position.x;
    MISSILE[i].missile.position.y=MI.mi.position.y-100;
    MISSILE[i].djx=DJ[MISSILE[i].dj][0].body.position.x;
    MISSILE[i].djy=DJ[MISSILE[i].dj][0].body.position.y;
    for(var x=0; x<MISSILE.length; x++){
        if(x==i){
           if(Music)MI.fashe[i].play();
        };
    };
};
document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(gameData.status==gameData.run || gameData.status==gameData.out){
      
      if(e && e.keyCode==37){ // 左 
       //camera.position.z=camera.position.z+1;//
       MI.direction=4;
        }
      if(e && e.keyCode==38){ // 上 
       //camera.position.y=camera.position.y+1;//
       MI.direction=1;
         }            
      if(e && e.keyCode==39){ // 右
       //camera.position.z=camera.position.z-1;//
       MI.direction=2;
      }
      if(e && e.keyCode==40){ // 下
       //camera.position.y=camera.position.y-1;//
       MI.direction=3;
      }
      if(e && e.keyCode==32){ // 发射
            if(MISSILE[0].emissions){
              if(MISSILE[0].emission==false){
                missleStart(0);
              }else if(MISSILE[1].emission==false){
                missleStart(1);
              }else if(MISSILE[2].emission==false){
                 missleStart(2);
              }else{
                missleStart(0);
              }
            };
      }
      if(e && e.keyCode==16){ // 视角切换
        if(MI.mi.scale.x==0.55)MI.camera(105,33);//obj1
        if(MI.mi.scale.x==0.7)MI.camera(87,26);//obj2
        if(MI.mi.scale.x==0.65)MI.camera(82,24.5);//obj3
      };
      if(e && e.keyCode==84){ //暂停/开始
        if(gameData.status==gameData.run){
            MI_BGM.pause();
            MI_BGM2.pause();
           gameData.status=gameData.out;
        }else{
            if(Music){
                MI_BGM.play();
            MI_BGM2.play();
            };
           gameData.status=gameData.run; 
        };
        };
    }
 }; 
document.onkeyup=function(event){
    if(gameData.status==gameData.run){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==37){ // 左 
          MI.direction=0;
        }
      if(e && e.keyCode==38){ // 上 
           MI.direction=0;
         }            
      if(e && e.keyCode==39){ // 右
          MI.direction=0;
      }
      if(e && e.keyCode==40){ // 下
          MI.direction=0;
      }
  };
};
    
//结束动画

function crashAnimate(){

    $("#mission").fadeIn(500,function (){
        $("#good").fadeIn(500,function (){
            $("#extratime").fadeIn(500,function (){
                $("#RIDEAGAIN,.home,.share").fadeIn(500);
                $("#RIDEAGAIN").css("transform","scale(1,1)"); 
                time=false;
                t1=0;
            });
            $("#extratime").css("transform","scale(1,1)"); 
        });
        $("#good").css("transform","scale(1,1)");
    });
    $("#mission").css("font-size","50px");
};
function extratime(){
    if(OSX<t3){
        OSX++;
        $("#extratime span:eq(0)").text("0"+Math.floor(OSX/60))
        $("#extratime span:eq(1)").text(Math.floor(OSX%60))
    };
    if(OSX>=t3){
        time=true;
    };
};

//游戏状态刷新

var dt=0.03;
function Refresh(){
    if(gameData.status!=gameData.run){
        if(controls!=0 && controls!=1)controls.update(dt);
        if(controls==1){
            camera.lookAt(scene.position);
            camera.position.x+=(230-camera.position.x)/30;
            if(camera.position.z<-16)camera.position.z+=(-24-camera.position.z)/30;
            if(camera.position.y<50)camera.position.y+=(70-camera.position.y)/30;
            if(camera.position.x>229){
                $("#ATTACK").fadeIn(500,function (){
                    $(".ChoiceBody ul li,.text p:eq(0)").fadeIn(300);
                    $(".text p:eq(0)").css("transform","scale(1,1)");
                });
                

                controls=0;
                controls=new THREE.OrbitControls(camera);
            }
            
        };
        if(OSY==102){
            if(ATTACK_x){
                if(camera.position.x>0)camera.position.x-=1;
            }else{
                if(camera.position.x<0)camera.position.x+=1;
            };
            if(ATTACK_z){
                if(camera.position.z>-190)camera.position.z-=1;
            }else{
                if(camera.position.z<-190)camera.position.z+=1;
            };

            if(ATTACK_y){
                if(camera.position.y>58)camera.position.y-=1;
            }else{


                if(camera.position.y<58)camera.position.y+=1;
            };
            camera.lookAt(scene.position);
        };
    };
    switch (gameData.status){
        case gameData.loading://loading
            loading();
            break;
        case gameData.start://开始
            $(".game_bg1,#Fleft,#Tright").stop(true);
            $(".game_bg1,#Fleft,#Tright").css("display","block");
            $(".game_bg1,#Fleft p,#Tright p").css("display","block");
            scene.add(MI.mi);
            scene.add(sky);
            sky.position.z=-15000;
            camera.position.set(0,28,-10);
            for(var i=0; i<map.length; i++){
                scene.add(map[i]);
                if(i==map.length-1)OSX=1000;
            };
            for(var i=0; i<DJ.length; i++){
                DJ[i][0].missiles=new mistructure(djEM[i],500,5,7);
                djEM[i].add(DJ[i][0].missiles.ms.cloud);
                DJ[i][0].missiles.ms.cloud.position.z=80;
                DJ[i][0].missiles.missile.rotation.y=-(1/180*Math.PI)*180;
                DJ[i][0].scenes();
                if(i==DJ.length-1)OSX++;
            };

            if(OSX>1000){
                gameData.status=gameData.transition;
                if(Music)MI_BGM.play();
                if(Music)MI_BGM2.play();
            }
            
            break;
        case gameData.transition: //过度
            mapMobile();
            DJs();
            if(map[0].position.z>-14000 && map[0].position.z<-4000){
                $(".loading2,.loading").css("transform","scale(2,2)");
                $(".loading2,.loading").fadeOut(500,function (){
                    $(".top_bg,.bot_bg").css("height","10%");
                    $(".task").fadeIn(500);
                });
            };
            if(map[0].position.z>-3000){
                $(".task").fadeOut(500,function (){
                    $("#aim,#aim_bg").fadeIn(1000);
                    $("#aim,#aim_bg").css("transform","scale(1,1)");
                });
                $(".task").css("transform","scale(1.1,1.1)")
                $("#logo").css({"left":"50px","top":"240px","margin-top":"-430px"});
                $("#logo svg").css({"transform":"scale(0.15,0.15) rotateY(0deg)"});
                $(".top_bg,.bot_bg").css("height","0");

                if(camera.position.z<28){

                    camera.position.z+=(28-camera.position.z)/10;
                };
                if(camera.position.z>27){
                    camera.position.z=28;
                    time =new Date();
                    t1=time.getTime();
                    gameData.status=gameData.run;
                };

            };
            break;
        case gameData.run: //运行
            mapMobile();
            DJs();
            MI.position1();
            MI.maps();
            MI.Mapcollision();
            MI.aim();
            MI.blastAnimate();
            MI.remind();
            times();
            missilEmobile();
            emissionM2();
            break;
        case gameData.out ://暂停
            times();
            break;
        case gameData.carryOut: //完成任务
            mapMobile();
            carryOut();
            MI.position1();
            break;
        case gameData.crash ://结束
            MI.bs();
            break;
    };
    canvas.render(scene,camera);
    requestAnimationFrame(Refresh);
};

//html部分
var Reading = document.getElementById("Reading");
var logomusic=document.getElementById("logomusic");
function svganimate(){
    var animate = document.getElementsByTagName("animate")[0];
    var animates = document.getElementsByTagName("animate")[1];        
    animate.beginElement();
    animates.beginElement();
};
var ready = true;
var loady = false
var _continue = document.getElementById("continue");
document.body.onclick = function (e){
    if(parseInt(Reading.innerHTML)==100){
        loady = true;
        _continue.style.display = 'none';
    }
}
function loading(){
    if(parseInt(Reading.innerHTML)==100 && ready){
        _continue.style.opacity = '1';
    }
    if(loady){
      if(OSZ==0){
            MI=Aircrafts[0];
            WYaddto(1);
            scene.add(sky);
            sky.position.y=145;
            camera.lookAt(scene.position)
            scene.add(Aircrafts[0].mi);
            Aircrafts[0].mi.scale.set(1,1,1)
            Aircrafts[0].mi.position.z=50;
        };

        if(OSZ>199){
            svganimate();
            $(".top_bg,.bot_bg").css("height","0");
            $(".loading,.loading2").css("transform","scale(2.5,2.5)");
            $("#logo").css("transition","transform 1.3s , margin 1.3s , top 1.3s , left 1.3s");
            $("#logo").css({"transform":"rotate(360deg)"});

            $(".loading,.loading2,.gool").fadeOut(700,function (){

                if(Music && ready){
                    ready = false;
                    var playPromise = logomusic.play();
                    if (playPromise !== null){
                        playPromise.catch(() => { logomusic.play();})
                    }
                }
                $("#logo").css({"margin-top":"-430px"});
                $("#logo svg").css({"transform":"scale(0.305,0.305) rotate(0deg) rotateY(180deg)","margin":"0px"});
                
                 if(parseInt($("#logo").css("margin-top"))==-430){
                   $(".body p:eq(0)").fadeIn(500,function (){
                     $(".body p:eq(1),.body p:eq(2)").fadeIn(500,function (){
                        $("#SELECTEAGLE").fadeIn(500,function (){
                            gameData.status=10;
                            if(Music){
                                BGM.play();
                                var playPromise = BGM.play();
                                if (playPromise !== null){
                                    playPromise.catch(() => { BGM.play();})
                                }
                            }
                        });
                        $("#SELECTEAGLE").css({"transform":"scale(1,1)"});
                     });
                     $(".body p:eq(1),.body p:eq(2)").css({"transform":"scale(1,1)"});

                   });
                   $(".body p:eq(0)").css({"transform":"scale(1,1)"});
                }
            });
        };
        OSZ++;
        
    };
    if(OSZ<200){
        OSX+=1.5;
        $("#logo").css({"transform":"rotate("+OSX+"deg)"})
        if(OSX==360)OSX=0;
        Reading.innerHTML=OSY+"%";
    };
};

document.getElementById("SELECTEAGLE").onclick=function (){
    $(".game_bg2").css("opacity" , ".2");
    $(".body").fadeOut(500,function (){
        $("#logo").css({"left":"50px","top":"240px"});
        $("#logo svg").css({"transform":"scale(0.15,0.15) rotateY(0deg)"});
        controls=1;
    });
    $(".body").css("transform","scale(1.55,1.55)");

};

$(".ChoiceBody ul li").click(function (){
    var index=$(this).index();
    for(var i=0; i<$(".ChoiceBody ul li").length; i++){
        if(index==i){
            $(".ChoiceBody ul li:eq("+i+")").css("transform","scale(1.2,1.2)");
            $(".ChoiceBody ul li:eq("+i+") svg").css("fill","#ffffff");
            $(".text p:eq("+i+")").css("transform","scale(1,1)");
            $(".text p:eq("+i+")").fadeIn(300);
            WYaddto(i+1);
            scene.add(Aircrafts[i].mi);
            MI=Aircrafts[i];
            if(i==0){Aircrafts[i].mi.scale.set(1,1,1)}
            if(i==1){Aircrafts[i].mi.scale.set(1.25,1.25,1.25); Aircrafts[i].mi.position.z=51;}
            if(i==2){Aircrafts[i].mi.scale.set(1.25,1.25,1.25); Aircrafts[i].mi.position.z=52;}
            MIindex=i;

        }else{
            $(".ChoiceBody ul li:eq("+i+")").css("transform","scale(1,1)");
            $(".ChoiceBody ul li:eq("+i+") svg").css("fill","#ffe000");
            $(".text p:eq("+i+")").css("transform","scale(1.4,1.4)");
            $(".text p:eq("+i+")").fadeOut(300);
            scene.remove(Aircrafts[i].mi);
        };

    };
});
var ATTACK_x;
var ATTACK_y;
var ATTACK_z;
$("#ATTACK").click(function (){
    $("#ATTACK").css("transform","scale(1.1,1.1)");
    $("#ATTACK,.text p,.ChoiceBody ul li").fadeOut(300)
    $(".prompt").css("transform","scale(1,1)");
    $(".prompt").fadeIn(300);
    OSY=102;
    controls=0;
    ATTACK_x=camera.position.x;
    ATTACK_z=camera.position.z;
    ATTACK_y=camera.position.y;

    camera = new THREE.PerspectiveCamera(50,canvasW/canvasH,1,5000);
    camera.lookAt(scene.position);
    camera.position.set(ATTACK_x,ATTACK_y,ATTACK_z);

    if(camera.position.z>-190){ATTACK_z=true;}
    else{ATTACK_z=false;}

    if(camera.position.x>0){ATTACK_x=true;}
    else{ATTACK_x=false;}

    if(camera.position.y>58){ATTACK_y=true;}
    else{ATTACK_y=false;}
    
});
var loadGames=true;
function loadGame(){
    loadGames=false;
    material=0;
    scene.remove(sky);
    scene.remove(light2);
    if(MIindex==0){
               
        MI.mi.children[20].scale.x=0.8;
        MI.mi.children[20].position.x=-3.5;
        MI.mi.children[21].scale.x=0.8;
        MI.mi.children[21].position.x=3.5;
    }
    sky=skyload("px","py","ny","nx","ny","nz",1364*100,701*100,35000);
    camera = new THREE.PerspectiveCamera(125,canvasW/canvasH,1,35000);

    light2=new THREE.PointLight(0xf1ecca);
    light2.position.set(8000,5500,-15000);
    scene.add(light2);
    scene.add(light);
    for(var i=0; i<Aircrafts.length; i++){
        scene.remove(Aircrafts[i].mi);
    };
    MIindexs();
    setTimeout(imagload,4000);
};

function imagload(){
   gameData.status=gameData.start;
};
function MIindexs(){
    if(MIindex==0)MI.mi.scale.set(0.55,0.55,0.32);MI.mi.position.z=0;
    if(MIindex==1)MI.mi.scale.set(0.7,0.65,0.44);MI.mi.position.z=0;
    if(MIindex==2)MI.mi.scale.set(0.65,0.65,0.45);MI.mi.position.z=0;
};

$(".ok").click(function (){
    $(".ChoiceBody").css("display","none");
    OSY=0;
    camera.position.set(0,58,-190);
    camera.lookAt(scene.position);
    Reading.style.display="none";
    $(".prompt").css("transform","scale(1.5,1.5)");
    $(".prompt,.game_bg3").fadeOut(300,function (){
        $(".top_bg,.bot_bg").css("height","50%");
        $("#logo").css({"top":"50%","left":"50%","margin":"-250px 0 0 -180px"});
        $("#logo svg").css({"transform":"scale(0.15,0.15) rotateY(180deg)"});
        $(".loading2,.loading").css("transform","scale(1,1)");
        $(".loading2,.loading").fadeIn(700,function (){
            $(".game_bg1,#Fleft,#Tright").css("display","block");
            if(loadGames)loadGame();
            BGM.pause();
        });
    });
});

$("#RIDEAGAIN").click(function (){
    MI.fbb.position.z=0; 
    MI.fbb.position.y=44;
    MI.fbb.position.x=0;
    RideAgain()
});
var RAs=true;
function RideAgain(){
    gameData.status=30;
    $("#aim,#aim_bg,#logo").stop(true);
    $(".top_bg,.bot_bg").css("height","50%");
    $("#logo").fadeIn(1000);
    $("#logo").css({"top":"50%","left":"50%","margin":"-250px 0 0 -180px"});
    $("#logo svg").css({"transform":"scale(0.15,0.15) rotateY(180deg)"});
    $(".loading2,.loading").css("transform","scale(1,1)");
    $(".loading2,.loading").fadeIn(500);

    A=-72000;
    time =new Date();
    t1=time.getTime();
    camera.position.set(0,28,-10);
    
    $(".content .home").fadeOut(1200,function (){
        $("#mission").css({"font-size":"70px","display":"none"});
        $("#good").css({"transform":"scale(2, 2)","display":"none"});
        $("#RIDEAGAIN").css({"transform":"scale(1.1, 1.1)","display":"none"});
        $("#extratime").css({"transform":"scale(1.5, 1.5)","display":"none"});
        $(".game_bg3,.game_bg2,.share").css("display","none");
        camera.position.set(0,28,-10);
        MI.mi.add(wy1.cloud)
        MI.mi.add(wy2.cloud)
        if(outSmoke!=0)MI.mi.remove(outSmoke.cloud);
        MI.remaining.innerHTML=24;
        scene.remove(MI.blast.cloud);
        MI.mi.position.set(0,-5,0);
        MI.life=3;
        MI.score=24;
        MI.aimIndex=-1;
        MI.remindTime=0;
        MI.direction=0;
        MI.time=0;
        MI.blastT=0;
        MI.deletes = true;
        MI.b=true;
        MI.index=0;
        MI.blast=0;
        MI.blastS=true;
        MI.blastIndex=0;
        MI.blastFun(0.3,0.02,0.1);
        MI.mi.rotation.set(0,0,0);

        MIindexs();
        for(var i=0; i<MISSILE.length; i++){
            scene.remove(MISSILE[i].missile);
            MISSILE[i].missile.position.set(0,0,-20);
            MISSILE[i].deletes = false;
            MISSILE[i].emission=false;
            MISSILE[i].emissions=false;
            MISSILE[i].djx=0;
            MISSILE[i].djy=0;
            MISSILE[i].dj=0;
            MISSILE[i].index=0;
            MISSILE[i].time=0;
            MISSILE[i].EMX=0;
            MISSILE[i].EMY=0;

        };

        for(var m=0; m<DJ.length; m++){
            scene.remove(DJ[m][0].blast.cloud);
            scene.remove(DJ[m][0].missiles.missile);
            DJ[m][0].missiles.missile.position.set(0,0,-20000);
            DJ[m][0].missiles.deletes = false;
            DJ[m][0].missiles.emission=false;
            DJ[m][0].missiles.emissions=false;
            DJ[m][0].missiles.djx=0;
            DJ[m][0].missiles.djy=0;
            DJ[m][0].missiles.dj=0;
            DJ[m][0].missiles.index=0;
            DJ[m][0].missiles.time=0;
            DJ[m][0].missiles.EMX=0;
            DJ[m][0].missiles.EMY=0;

            DJ[m][0].direction=0;
            DJ[m][0].time=0;
            DJ[m][0].blastT=0;
            DJ[m][0].deletes = true;
            DJ[m][0].b=true;
            DJ[m][0].index=0;
            DJ[m][0].time=0;
            DJ[m][0].deletes=true;
            DJ[m][0].body.visible=true;
            DJ[m][0].life=3;
            if(DJ[m][2]){
                DJ[m][0].body.position.set(DJ[m][1],0,-10000);
            }else{
                DJ[m][0].body.position.set(DJ[m][1],300,-9300);
            };
            if(m>4){
                DJ[m][0].body.position.set(DJ[m][1],3000,-9300);
            };

        };

        for(var x=0; x<map.length; x++){
            A=A+19000;
            if(x==7){
                A=-53000;
            };
            map[x].position.set(A,-5608-1500,-15000);
            if(x>6){
                map[x].position.set(A,-5608-1500,-44000);
            };
            if(x==map.length-1)gameData.status=gameData.start;
        }; 
        mapspeed=40;
    });
};

var butmusic=document.getElementById("butmusic");
$(".but,.ChoiceBody ul li,.ok,.share").mouseover(function (){
    if(Music)butmusic.play();
});

var BGM;
var MI_BGM;
var MI_BGM2;
    BGM = document.getElementById("BMG");
    MI_BGM = document.getElementById("MI_bg");
    MI_BGM2 = document.getElementById("MI_bg2");
    BGM.oncanplay=function (){OSY++;};
    MI_BGM.oncanplay=function (){OSY++;};
    MI_BGM2.oncanplay=function (){OSY++;};
$("#music").click(function (){
    if(Music){
        Music=false;
        var music=document.getElementsByTagName("audio");
        for(i=0; i<music.length; i++){
            music[i].pause();
        };
    }else{
        Music=true;
        if(gameData.status==gameData.run){
            MI_BGM.play();
            MI_BGM2.play();
        };
        if(gameData.status==10){
            BGM.play();
        };
        if(gameData.status==gameData.crash){
            MI_BGM2.play();
        };
    };

});
//尾焰添加
function WYaddto(i){
    if(i==1){
        WYFun(6,21,15,0.09,0.05,6,"img/weiyan2.png");
        Aircrafts[0].mi.add(wy1.cloud);
        Aircrafts[0].mi.add(wy2.cloud);
    }else if(i==2){
        WYFun(8.4,16,24,0.06,0.03,4.2,"img/weiyan.png");
        Aircrafts[1].mi.add(wy1.cloud);
        Aircrafts[1].mi.add(wy2.cloud);
    }else if(i==3){
        WYFun(11,16.5,22,0.06,0.03,4.5,"img/weiyan.png");
        Aircrafts[2].mi.add(wy1.cloud);
        Aircrafts[2].mi.add(wy2.cloud);
    };
};
Refresh();

window.onload=function(){
    OSY+=25;
    mapload();
};





