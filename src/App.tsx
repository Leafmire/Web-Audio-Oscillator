import React from 'react';
import Oscillator from 'components/oscillator';

function App() {
	const audioCtx = new AudioContext(); //allows access to webaudioapi
	return (
		<div className="flex justify-center items-center">
			<Oscillator audioCtx={audioCtx} />
		</div>
  	);
}

export default App;
