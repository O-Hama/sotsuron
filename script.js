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

//人差し指のワールド座標を計算
const calWorldCoordinate = (x, y, z) =>{
    if(window.innerWidth > window.innerHeight){
        let worldCoordinate = [];
        let worldX;
        let worldY;
        let worldZ = -0.5;
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
        let worldZ = -0.5;
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

/*オブジェクトの向きを計算
const calObjectDirection = (handPoint) =>{
    let ObjectDirection = [];
    return ObjectDirection;

};
*/


hands.onResults(results => {
    if(results.multiHandLandmarks.length > 0){
        let handPoint = [];
        handPoint = results.multiHandLandmarks;

        let resultWorldCoordinate = calWorldCoordinate(handPoint[0][8].x, handPoint[0][8].y, handPoint[0][8].z);
        //let resultObjectDirection = calObjectDirection(handPoint);
        document.getElementById("model").setAttribute("position", {x: resultWorldCoordinate[0], y: resultWorldCoordinate[1], z: resultWorldCoordinate[2]});
        console.log(resultWorldCoordinate, results.multiHandLandmarks[0][8].x);
    }
});

camera.start();
