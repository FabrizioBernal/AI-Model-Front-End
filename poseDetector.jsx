import React, { useRef, useState } from 'react';

import * as tf from '@tensorflow/tfjs';

import Webcam from "react-webcam";

import ReactDOM from 'react-dom'; 


const LoadAndRunModel = () => {

const webcamRef = useRef(null);

const [model, setModel] = useState(null);

const [pose, setPose] = useState(null); // new state to keep track of the pose


const loadModel = async () => {

const model = await tf.loadLayersModel('http://127.0.0.1:8080/model.json');

setModel(model);

console.log('Model loaded successfully');

}


const predict = async () => {

if (model !== null && webcamRef.current && webcamRef.current.video.readyState === 4) {

// Get Video Properties

const video = webcamRef.current.video;

const {videoWidth, videoHeight} = video;


// Make Detections

const img = tf.browser.fromPixels(webcamRef.current.video);

const resized = tf.image.resizeBilinear(img, [150, 150, ]); 

const casted = resized.cast('float32');

const expanded = casted.expandDims(0);

const prediction = await model.predict(expanded).data(); // Get prediction


const probability = prediction[0]; // Get the probability of the pose

const classNames = ['nothing', 'jab']; // Reverse the classes (0 = not_pose1, 1 = pose1)


console.log(`Model's best guess is ${classNames[probability > 0.5 ? 1 : 0]} with a probability of ${probability}`);

setPose(classNames[probability > 0.5 ? 1 : 0]); // set the pose state

}

}


// load the model when the component mounts

React.useEffect(() => {

loadModel();

}, []);


// continuously make predictionsi

React.useEffect(() => {

const interval = setInterval(() => {

predict();

}, 1000);

return () => clearInterval(interval);

}, [model]);


return (

<div>

<Webcam ref={webcamRef} screenshotFormat="image/jpeg" />

{pose && <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '30px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>{pose}</div>} {/* display the pose */}

</div>

);

}


ReactDOM.render(<LoadAndRunModel />, document.getElementById('root')); 