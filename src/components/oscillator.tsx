import React, { useEffect, useRef } from 'react';
import { useState } from 'react';

export default function Oscillator({ audioCtx }: { audioCtx: AudioContext }) {
	const [oscPitch, setOscPitch] = useState("90");
	const [volume, setVolume] = useState("0.5");
	const [oscType, setOscType] = useState<OscillatorType>("sine");
	const [isPlaying, setIsPlaying] = useState(false);
	const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
	const [gainNode, setGainNode] = useState<GainNode | null>(null);
	const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
	const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		canvas.width = 300;
		canvas.height = 300;
		ctx.fillStyle = "#181818";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "#33ee55";
		ctx.beginPath();
		ctx.moveTo(0, canvas.height / 2);
		ctx.lineTo(canvas.width, canvas.height / 2);
		ctx.stroke();

		const newAnalyser = audioCtx.createAnalyser();
		newAnalyser.fftSize = 2048;
		setDataArray(new Uint8Array(newAnalyser.frequencyBinCount));
		setAnalyser(newAnalyser);
	}, []);

	useEffect(() => {
		const newGainNode = audioCtx.createGain();
		newGainNode.gain.value = parseFloat(volume);
		setGainNode(newGainNode);
	}, [volume]);

	function drawAnalyser() {
		if (!analyser || !canvasRef.current || !dataArray) {
			return;
		}
		analyser.getByteTimeDomainData(dataArray);
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		const bufferLength = analyser.frequencyBinCount;
		const segmentWidth = canvas.width / bufferLength;
		ctx?.fillRect(0, 0, canvas.width, canvas.height);
		ctx?.beginPath();
		for (let i = 1; i < bufferLength; i++) {
			const x = i * segmentWidth;
			const y = ((dataArray[i] / 128) * canvas.height) / 2;
			ctx?.lineTo(x, y);
		}
		ctx?.stroke();
		requestAnimationFrame(drawAnalyser);
	}

	function playOsc() {
		if (!isPlaying) {
			const oscillator = audioCtx.createOscillator(); //creates oscillator
			oscillator.type = oscType; //chooses the type of wave
			oscillator.frequency.value = parseInt(oscPitch); //assigning the value of oscPitch to the oscillators frequency value
			if (gainNode && analyser) {
				oscillator.connect(gainNode); //connects the oscillator to the gain node
				gainNode.connect(analyser); // connects the gain node to the analyser
				analyser.connect(audioCtx.destination); //connects the analyser to the audio context
				oscillator.start(audioCtx.currentTime); //starts the sound at the current time
				drawAnalyser();
				setOscillator(oscillator);
				setIsPlaying(true);
			}
		}
		else {
			if (!oscillator) {
				return;
			}
			oscillator.stop(audioCtx.currentTime); //stops the sound at the current time
			analyser?.disconnect(audioCtx.destination); //disconnects the gain node from the audio context
			setIsPlaying(false);
		}
	}

	function changePitch(newPitch : string) {
		if (!oscillator) {
			return;
		}
		setOscPitch(newPitch);
		oscillator.frequency.value = parseInt(newPitch);
	}

	function changeVolume(newVolume : string) {
		if (!gainNode) {
			return;
		}
		setVolume(newVolume);
	}

	function selectOscType(type: string) {
		if (!oscillator) {
			return;
		}
		if (!["sine", "square", "sawtooth", "triangle"].includes(type)) {
			return;
		}
		const newType = type as OscillatorType;
		setOscType(newType);
		oscillator.type = newType;
	}

	return (
		<div className='max-w-3xl m-auto p-8'>
			<div className="flex flex-col">
				<button id="osc" className='w-32 py-2 bg-slate-800 text-white shadow mb-4' onClick={playOsc}>
					{isPlaying ? "Stop" : "Play"}
				</button>
				<div className='mb-2'>
					<p>Frequency</p>
					<div className='w-32 mb-2 flex'>
						<input className='mr-2' type="range" id="oscPitch" onChange={(e) => { changePitch(e.target.value) }}
							min="50" max="500" step="1" value={oscPitch} />
						<span className=''>{oscPitch}</span>
					</div>
				</div>
				<div className='mb-2'>
					<p>Volume</p>
					<div className='w-32 flex'>
						<input className='mr-2' type="range" id="oscVolume" onChange={(e) => { changeVolume(e.target.value) }}
						min="0" max="1" step="0.1" value={volume} />
						<span className=''>{volume}</span>
					</div>
				</div>
				<div className='mb-2'>
					<p>Type</p>
					<div className='w-32 mb-2 flex'>
						<fieldset id="oscType">
							<div>
								<input className='mr-2' type="radio" id="sine" onChange={(e) => { selectOscType(e.target.value) }} name="oscType" value="sine" checked={oscType === "sine"}></input>
								<label htmlFor="sine">Sine</label>
							</div>
							<div>
								<input className='mr-2' type="radio" id="square" onChange={(e) => { selectOscType(e.target.value) }} name="oscType" value="square" checked={oscType === "square"}></input>
								<label htmlFor="square">Square</label>
							</div>
							<div>
								<input className='mr-2' type="radio" id="sawtooth" onChange={(e) => { selectOscType(e.target.value) }} name="oscType" value="sawtooth" checked={oscType === "sawtooth"}></input>
								<label htmlFor="sawtooth">Sawtooth</label>
							</div>
							<div>
								<input className='mr-2' type="radio" id="triangle" onChange={(e) => { selectOscType(e.target.value) }} name="oscType" value="triangle" checked={oscType === "triangle"}></input>
								<label htmlFor="triangle">Triangle</label>
							</div>
							<div>
								<input className='mr-2' type="radio" id="custom" onChange={(e) => { selectOscType(e.target.value) }} name="oscType" value="custom" checked={oscType === "custom"}></input>
								<label htmlFor="custom">Custom</label>
							</div>
						</fieldset>
					</div>
				</div >
			</div >
			<canvas id="oscilloscope" ref={canvasRef}></canvas>
		</div >
	);
}



