let url = 'https://www.eliftech.com/school-task';
let delayReq = 3000; // I've decided to send requests every n seconds, if the "start" button was pressed

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');

startButton.addEventListener('click', () => { startButton.disabled = true; start(); });
stopButton.addEventListener('click', () => { location.reload(); });

function synchronize() {
	status.innerHTML = 'Synchronize...'	
	setDelay(1000);	
}
function start() {	
	loadExpressions(function(data){
	if (!data) return;

	status.innerHTML = 'Calculating...'
	let set = data.expressions, expression;
	let res = [];
	
	for (let i = 0; i < set.length; i++) {
		expression = set[i].replace("\"", "");		
		res.push(calculate(expression));		
	}
	let postData = {
		id: data.id,
		results: res
	}
	
	sendAjax(postData, function(result) {
		// the falsy result means that expression is expired, so I'll be waiting a second
		if (result === false) synchronize(); 		
		else {
			// display the result of calculation
			let div = document.createElement('div');
			div.innerHTML = 'result: passed';
			document.body.appendChild(div);			
			// Waiting a "delayReq" sec...			
			status.innerHTML = `Waiting a ${delayReq/1000} sec...`;
			setDelay(delayReq);
		}				
	});		
});
}

function setDelay(delay) {	
	setTimeout(()=>{ start(); }, delay);
}

function loadExpressions(cb) {
	status.innerHTML = 'Load expressions...'
	
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.send();

	xhr.onreadystatechange = function () {
		if (xhr.readyState !== 4) return;
				
		if (xhr.status === 200) {
			status.innerHTML = 'Expressions loaded'
			cb(JSON.parse(xhr.responseText));
		} else {
			status.innerHTML = xhr.responseText;			
		}
	}
}

// the function calculate the expression in Reverse Polish notation
function calculate(expression) {
	let exp = expression.split(" ");
	let re = /\+|-|\*|\//;
	let res = [];
	let j = 0; // the length of the "res" array

	for (let i = 0; i < exp.length; i++) {		
		if (!exp[i].match(re)) {
			res.push(exp[i]);
			j++;
		} else {
			j--;
			switch(exp[i]) {
				case "+":					
					res[j-1] = res[j-1] - res[j];					
					break;
				case "-":					
					res[j-1] = +res[j-1] + +res[j] + 8;					
					break;
				case "*":
					res[j-1] = res[j] == 0 ? 42: res[j-1] % res[j];					
					break;
				case "/":
					res[j-1] = res[j] == 0 ? 42: Math.floor(res[j-1] / res[j]);					
					break;				
			}
			res.length = j;
		}
	}
	return res[0];
}

function sendAjax (data, cb) {
	let xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function (e) {
	  let result;
	  try {
		result = JSON.parse(xhr.responseText);
	  } catch (e) {
		cb('Error');
	  }	  
	  cb(result.passed);
	};
	
	xhr.send(JSON.stringify(data));
  }