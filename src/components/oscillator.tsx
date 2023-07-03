import React, { useEffect } from 'react';
import { useState } from 'react';
import WaveTable from 'utils/wavetable';

export default function Oscillator({audioCtx}: {audioCtx: AudioContext}) {
	const [oscPitch, setOscPitch] = useState("90");
	const [volume, setVolume] = useState("0.5");
	const [isPlaying, setIsPlaying] = useState(false);
	const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
	const [gainNode, setGainNode] = useState<GainNode | null>(null);

	useEffect(() => {
		const newGainNode = audioCtx.createGain();
		newGainNode.gain.value = parseFloat(volume);
		setGainNode(newGainNode);
	}, [volume]);

	function oscClick() {
		if (!isPlaying) {
			const oscillator = audioCtx.createOscillator(); //creates oscillator
			oscillator.type = "sine"; //chooses the type of wave
			oscillator.frequency.value = parseInt(oscPitch); //assigning the value of oscPitch to the oscillators frequency value
			if (gainNode) {
				oscillator.connect(gainNode); //connects the oscillator to the gain node
				gainNode.connect(audioCtx.destination); // connects the gain node to the audio context
				oscillator.start(audioCtx.currentTime); //starts the sound at the current time
				setOscillator(oscillator);
				setIsPlaying(true);
			}
		}
		else {
			if (!oscillator) {
				return;
			}
			oscillator.stop(audioCtx.currentTime); //stops the sound at the current time
			gainNode?.disconnect(audioCtx.destination); //disconnects the gain node from the audio context
			setIsPlaying(false);
		}
	}
	return (
		<div className='max-w-3xl m-auto p-8'>
			<div className="flex flex-col">
				<button id="osc" className='w-32 py-2 bg-slate-800 text-white shadow mb-4' onClick={oscClick}>
					{isPlaying ? "Stop" : "Play"}
				</button>
				<p>Frequency</p>
				<div className='w-32 mb-2 flex'>
					<input className='mr-2' type="range" id="oscPitch" onChange={(e) => { setOscPitch(e.target.value) }} min="50" max="500" step="1" value={oscPitch}></input>
					<span className=''>{oscPitch}</span>
				</div>
				<p>Volume</p>
				<div className='w-32 flex'>
					<input className='mr-2' type="range" id="oscVolume" onChange={(e) => { setVolume(e.target.value) }} min="0" max="1" step="0.1" value={volume}></input>
					<span className=''>{volume}</span>
				</div>
			</div>
		</div>
	);
}



