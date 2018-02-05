let url = 'https://www.eliftech.com/school-task';

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const status = document.getElementById('status');
const error = document.getElementById('error');


startButton.addEventListener('click', () => { synchronize(); start() });
stopButton.addEventListener('click', function() { startButton.disabled = true; });

function synchronize(prev) {
	status.innerHTML = 'Synchronize...'	
	loadExpressions(function(data){
		if (!data) return;
		if(!!prev && prev.id !== data.id) return;
		synchronize(data);
	});
}
function start() {
	let startTime = Date.now();	
	loadExpressions(function(data){
	if (!data) return;

	status.innerHTML = 'Calculating...'
	let set = data.expressions, expression;
	let res = [];
	console.log(set);	
	for (let i = 0; i < set.length; i++) {
		expression = set[i].replace("\"", "");
		console.log(expression);
		res.push(calculate(expression));
		console.log(res[i]);
	}
	let postData = {
		id: data.id,
		results: res
	}

	sendAjax(postData, function(result) {
		status.innerHTML = 'Waiting a 10 sec...';	
		
		let div = document.createElement('div');
		div.innerHTML = result;
		document.body.appendChild(div);
	});
	console.log(postData);
	let endTime = Date.now();
	setTimeout(function(){ startButton.click() }, 10000-(endTime -startTime));
});
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

function calculate(expression) {
	let exp = expression.split(" ");
	let re = /\+|-|\*|\//;
	let res = [];
	let j = 0;

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