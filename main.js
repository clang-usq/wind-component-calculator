const chartElement = document.getElementById("chart");
const chart = echarts.init(chartElement);
let theta_degrees = 0;
let v_mag = 0;
let v_axis_ns = 0;
let v_axis_ew = 0;

let deltaT_ew = 0;
let deltaT_ns = 0;

//event handlers
document.getElementById('deltaTVns').addEventListener('input', rebuildChart);

document.getElementById('deltaTVew').addEventListener("input", rebuildChart);

const option = {
	title: {
		text: "Wind Chart - Ultrasonic Chart",
		left: "center"
	},
	angleAxis: [
		{
			type : 'value',
			min: 0,
			max: 360,
			startAngle: 90,
		},

	],
	radiusAxis: {
		min: 0,
		max: 30,
	},
	polar: {},
	series: [
		{
		type: 'line',
		data: [
			{
				value: [0, theta_degrees],
				symbol: 'none'
			},
			{
				value: [v_mag, theta_degrees],
				symbol: 'arrow',
				symbolSize: 15,
				symbolRotate: -theta_degrees,
			}
		],
		coordinateSystem: 'polar',
		symbol : ['none', 'circle'],
		symbolSize: 15,
		},
		
		

	]


};

function axisVelocityAverage(deltaT_ns, deltaT_ew)
{
	//average the return of the 8 pulses

	deltaT_ns = deltaT_ns * 1e-6;
	deltaT_ew = deltaT_ew * 1e-6;
	//average the return of the opposite direction 8 pulses
	// d/(c + v_axis) where d - distance between ultrasonic sensors, c is the constant for wind speed and v_axis 
	const d = 0.1; //10cm between USensors
	const c = 343; // ~343m/s in air


	//delta_t  - time forward - time reverse
	//do calc here to find the change in time on each axis - below is fixed numbers for demo calcing
	

	//change in t_axis for ns and ew


	//quadratic
	v_axis_ns = (-d + Math.sqrt(d * d + c * c * deltaT_ns * deltaT_ns)) / deltaT_ns;

	v_axis_ew = (-d + Math.sqrt(d * d + c * c * deltaT_ew * deltaT_ew)) / deltaT_ew;

	//for checking math
	console.log(v_axis_ns);
	console.log(v_axis_ew);


	//find vector magnitude
	v_mag = Math.sqrt((v_axis_ns * v_axis_ns) + (v_axis_ew * v_axis_ew));

	//find wind direction -- this is in radians so need to convert to angle
	const theta = Math.atan2(v_axis_ns, v_axis_ew);
	theta_degrees = theta * 180/Math.PI;

	console.log(theta_degrees);

	console.log(v_mag);

}

function updateFormulaMath(deltaVns, deltaVew) {
	document.getElementById('velocityFormula').textContent =
		`$$v_{NS} = \\frac{-0.1 + \\sqrt{0.1^2 + 343^2 (${deltaVns} \\times 10^{-6})^2}}{${deltaVns} \\times 10^{-6}} = ${v_axis_ns.toFixed(2)}\\text{ m/s}$$` +
		`$$v_{EW} = \\frac{-0.1 + \\sqrt{0.1^2 + 343^2 (${deltaVew} \\times 10^{-6})^2}}{${deltaVew} \\times 10^{-6}} = ${v_axis_ew.toFixed(2)}\\text{ m/s}$$`;

	document.getElementById('magnitudeFormula').textContent =
		`$$\\vec{V} = \\sqrt{${v_axis_ns.toFixed(2)}^2 + ${v_axis_ew.toFixed(2)}^2} = ${v_mag.toFixed(2)}\\text{ m/s}$$`;

	document.getElementById('thetaFormula').textContent =
		`$$\\theta = \\operatorname{atan2}(${v_axis_ns.toFixed(2)}, ${v_axis_ew.toFixed(2)}) = ${theta_degrees.toFixed(1)}^\\circ$$`;

	if (window.MathJax?.typesetPromise) {
		MathJax.typesetPromise([
			document.getElementById('velocityFormula'),
			document.getElementById('magnitudeFormula'),
			document.getElementById('thetaFormula')
		]);
	}
}

function rebuildChart(){
	const deltaVns = Number(document.getElementById('deltaTVns').value);
	console.log(deltaVns);

	const deltaVew = Number(document.getElementById('deltaTVew').value);
	console.log(deltaVew);

	if (!deltaVns || !deltaVew) {
		return;
	}

	axisVelocityAverage(deltaVns, deltaVew);
	updateFormulaMath(deltaVns, deltaVew);

	chart.setOption({
			series: [
				{
					data: [
						{
							value: [0, theta_degrees],
							symbol: 'none'
						},
						{
							value: [v_mag, theta_degrees],
							symbol: 'arrow',
							symbolSize: 15,
							symbolRotate: -theta_degrees,
						}
					]
				}
			]
		});
}


chart.setOption(option);
rebuildChart();

window.addEventListener("resize", () => {
	chart.resize();
});
