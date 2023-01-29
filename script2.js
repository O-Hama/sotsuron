// カメラ映像取得 
const video = document.getElementById('input');

// hand.jsに必要な関連ファイル 
const config ={
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
};

const hands = new Hands(config);

//カメラ映像をhand.js用で設定
const camera = new Camera(video, {
    onFrame : async () =>{
        await hands.send({image: video});
    },
    width: window.innerWidth,
    height: window.innerHeight,
    facingMode: 'environment'//外カメ
});

//hand.jsの基本設定
hands.setOptions({
    maxNumHands: 1,                 //検出する手を最大１つに設定
    modelComplexity: 1,             //検出精度(デフォルト)
    minDetectionConfidence: 0.5,    //検出の信頼度(デフォルト)
    minTrackingConfidence: 0.5      //ランドマーク追跡の信頼度(デフォルト)
});

let beforeV = 1;

//人差し指の座標を計算
const calWorldCoordinate = (x, y, z, w) =>{
    let worldZ;
    let V05x;
    let V05y;
    let V05z;
    let Vlength;
    
    V05x = w.x - x;
    V05y = w.y - y;
    V05z = w.z - z;

    Vlength = Math.sqrt((V05x * V05x) + (V05y * V05y) + (V05z * V05z));

    worldZ = -0.3 / (Vlength / beforeV);

    if(window.innerWidth > window.innerHeight){
        let worldCoordinate = [];
        let worldX;
        let worldY;
        let asp = window.innerWidth / window.innerHeight;
        let hws;
        let hw;
        let hw2;
        let hh;
        let px;
        let py;
        let lenX;
        let lenY;

        hws = worldZ * Math.tan(20 * Math.PI/180);
        hw = window.innerWidth / 2;
        hw2 = hw / asp;
        px = x * window.innerWidth;
        lenX = px - hw;
        worldX = lenX * hws / hw2;

        hh = window.innerHeight / 2;
        py = y * window.innerHeight;
        lenY = py - hh;
        worldY = lenY * hws / hh;


        worldCoordinate[0] = -1 * worldX;
        worldCoordinate[1] = worldY;
        worldCoordinate[2] = worldZ;

        return worldCoordinate;
    }else{
        let worldCoordinate = [];
        let worldX;
        let worldY;
        let asp = window.innerHeight / window.innerWidth;
        let hws;
        let hw;
        let hh;
        let hh2;
        let px;
        let py;
        let lenX;
        let lenY;

        hws = worldZ * Math.tan(20 * Math.PI/180);
        hh = window.innerHeight / 2;
        hh2 = hh / asp;
        py = y * window.innerHeight;
        lenY = py - hh;
        worldY = lenY * hws / hh2;

        hw = window.innerWidth / 2;
        px = x * window.innerWidth;
        lenX = px - hw;
        worldX = lenX * hws / hw;


        worldCoordinate[0] = -1 * worldX;
        worldCoordinate[1] = worldY;
        worldCoordinate[2] = worldZ;

        return worldCoordinate;
    }
};

//オブジェクトの向きを計算
const calObjectDirection = (handPoint) =>{
    let ObjectDirection = [];
    let point = [];
    let V013 = [];
    let V05 = [];
    let Vnormal = [];
    let cosX;
    let cosY;
    let rotationX;
    let rotationY;
    
    point = handPoint;

    //0,13 ベクトル
    V013[0] = point[0][13].x - point[0][0].x;
    V013[1] = point[0][13].y - point[0][0].y;
    V013[2] = point[0][13].z - point[0][0].z;

    //0,5 ベクトル
    V05[0] = point[0][5].x - point[0][0].x;
    V05[1] = point[0][5].y - point[0][0].y;
    V05[2] = point[0][5].z - point[0][0].z;

    //法線ベクトル
    Vnormal[0] = V013[1] * V05[2] - V013[2] * V05[1];
    Vnormal[1] = V013[2] * V05[0] - V013[0] * V05[2];
    Vnormal[2] = V013[0] * V05[1] - V013[1] * V05[0];

    //(0,0,1)となす角 z-y
    cosX = Vnormal[2] / Math.sqrt((Vnormal[2] * Vnormal[2]) + (Vnormal[1] * Vnormal[1]));
    rotationX = Math.acos(cosX) * 180 / Math.PI;

    //(0,0,1)となす角 z-x
    cosY = Vnormal[2] / Math.sqrt((Vnormal[2] * Vnormal[2]) + (Vnormal[0] * Vnormal[0]));
    rotationY = Math.acos(cosY) * 180 / Math.PI;

    
    if(rotationY > 90){
        rotationX = 180 - rotationX;
    }
    
    if(rotationX < 90){
        rotationY = 180 - rotationY;
    }
    

    ObjectDirection[0] = rotationX;
    ObjectDirection[1] = rotationY;

    return ObjectDirection;
};


//毎フレームでの処理
hands.onResults(results => {
    //手の座標取得かつ右手（mediapipe hands は左右の判定が逆であるため"Left"を指定）の場合のみ蝶を表示
    if(results.multiHandLandmarks.length > 0 && results.multiHandedness[0].label == "Left"){
        let handPoint = [];

        handPoint = results.multiHandLandmarks;

        let resultWorldCoordinate = calWorldCoordinate(handPoint[0][8].x, handPoint[0][8].y, handPoint[0][8].z, handPoint[0][0]);
        let resultObjectDirection = calObjectDirection(handPoint);

        document.getElementById("model").setAttribute("position", {x: resultWorldCoordinate[0], y: resultWorldCoordinate[1], z: resultWorldCoordinate[2]});
        document.getElementById("model").setAttribute("rotation", {x: resultObjectDirection[0], y: resultObjectDirection[1], z: 0});
        document.getElementById("model").setAttribute("visible", "true");
    }else
    {
        document.getElementById("model").setAttribute("visible", "false");
    }
});

//mediapipe hands 用カメラ起動
camera.start();