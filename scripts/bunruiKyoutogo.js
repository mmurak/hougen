class GlobalManager {
	constructor() {
		this.URL = 'https://dl.ndl.go.jp/pid/12449309/1/';
		this.tocSel = document.getElementById("TOCSel");
		this.entryField = document.getElementById("EntryField");
		this.content = document.getElementById("Content");
		this.dialogWindow = document.getElementById('DialogWindow');

		this.LOCALSTORAGEKEY = 'bunruikyoutogojiten';
		this.settingsDB = loadSettings(this.LOCALSTORAGEKEY);
		if (Object.keys(this.settingsDB).length == 0) {
			for (let item of Object.values(legendMap)) {
				const arr = item.split(':');
				if (arr.length == 1) {
					this.settingsDB[arr[0]] = true;
				}
			}
		}

		this.dialogArea = document.getElementById('DialogArea');
		const bAllSet = document.createElement('button');
		bAllSet.innerHTML = 'Check all';
		bAllSet.onclick = setAll;
		this.dialogArea.appendChild(bAllSet);
		const bAllClear = document.createElement('button');
		bAllClear.innerHTML = 'Clear all';
		bAllClear.onclick = clearAll;
		this.dialogArea.appendChild(bAllClear);
		this.dialogArea.appendChild(document.createElement('br'));
		const table = document.createElement('table');
		this.dialogArea.appendChild(table);
		const cellMax = 5;
		let cellCounter = cellMax;
		let row = null;
		for (let item of Object.keys(this.settingsDB)) {
			if (cellCounter >= cellMax) {
				row = table.insertRow(-1);
				cellCounter = 0;
			}
			const cell = row.insertCell(-1);
			cell.style.border = '1px solid black';
			const cb = document.createElement('input');
			cb.type = 'checkbox';
			cb.id = item;
			cb.checked = this.settingsDB[item];
			cb.addEventListener('change', (evt) => {
				this.settingsDB[item] = cb.checked;
			});
			cell.appendChild(cb);
			cell.appendChild(document.createTextNode(item));
			cellCounter++;
		}
	}
}

const G = new GlobalManager();
const R = new Regulator2026();
G.entryField.focus();


// build up selector
const selHeader = document.createElement("option");
selHeader. name = "";
selHeader.value = 0;
G.tocSel.appendChild(selHeader);

for (let i = 1; i < preamble.length; i++) {
	const elem = document.createElement("option");
	elem.text = preamble[i][0];
	elem.value = preamble[i][1];
	G.tocSel.appendChild(elem);
}
const elem = document.createElement("option");
elem.disabled = true;
elem.innerHTML = '−・−・−・−・−・−・−・−・−・−';
G.tocSel.appendChild(elem);
for (let i = 1; i < postamble.length; i++) {
	const elem = document.createElement("option");
	elem.text = postamble[i][0];
	elem.value = postamble[i][1];
	G.tocSel.appendChild(elem);
}


G.entryField.addEventListener("compositionupdate", (evt) => {
	G.tocSel.selectedIndex = -1;
	G.content.innerHTML = '';
	if (evt.data == '') {
		return;
	}
	G.entryField.value = '';
	searchEntry(evt.data);
});

function searchEntry(val) {
	const extracted = contentsIndex.filter((x) => {
		const entry = x[0];
		const category = legendMap[x[2]].split(/:/)[0];
		return entry.startsWith(val) && G.settingsDB[category];
	});
	if (extracted.length > 0) {
		displayResult(extracted);
	}
}

G.entryField.addEventListener("keydown", (evt) => {
	G.tocSel.selectedIndex = -1;
	G.content.innerHTML = '';
	if (evt.key == 'Escape') {
		 clearEntryField();
	}
});

function setAll() {
	for (let item of Object.keys(G.settingsDB)) {
		document.getElementById(item).checked = true;
		G.settingsDB[item] = true;
	}
}
function clearAll() {
	for (let item of Object.keys(G.settingsDB)) {
		document.getElementById(item).checked = false;
		G.settingsDB[item] = false;
	}
}

function clearEntryField() {
	G.entryField.value = '';
	G.content.innerHTML = '';
	G.entryField.focus();
}

function displayResult(extractedList) {
	const table = document.createElement('table');
	for (let item of extractedList) {
		const row = table.insertRow(-1);
		const cell0 = row.insertCell(0);
		const a = document.createElement('a');
		a.href = `javascript:jumpTo(${item[1]});`;
		a.innerHTML = item[0];
		cell0.appendChild(a);
		const cell1 = row.insertCell(1);
		cell1.innerHTML = `［${legendMap[item[2]]}］`;
		if (item[3] != '') {
			const cell2 = row.insertCell(2);
			cell2.innerHTML = `➡ ${item[3]}`;
		}
	}
	G.content.innerHTML = '';
	G.content.appendChild(table);

}


function tocChange(val) {
	G.content.innerHTML = '';
	if (val == -1)  return;
	G.entryField.value = "";
	G.entryField.focus();
	if (G.tocSel.selectedIndex < 7) {
		windowOpen(preamble[0], val, '付録');
	} else if (val < 0) {
		let anchors = '';
		if (val == -101) {
			for (let item of furoku01) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		} else if (val == -110) {
			for (let item of furoku02) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		} else if (val == -120) {
			for (let item of furoku03) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		} else if (val == -999) {
			for (let item of taiwarei) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		}
		G.content.innerHTML = anchors;
	} else {
		windowOpen(postamble[0], val, '付録');
	}
}

function windowOpen(url, page, windowType) {
	window.open(url + page, windowType);
	G.entryField.focus();
}

function jumpTo(val) {
	windowOpen(G.URL, val, '付録');
}

function loadSettings(appKey) {
	try {
		const raw = localStorage.getItem(appKey);
		return raw ? JSON.parse(raw) : {};
	} catch (error) {
		// 保存データが壊れている場合などはデフォルト(空)として扱う
		console.error("設定の読み込みに失敗しました:", error);
		return {};
	}
}
function saveSettings(settings, appKey) {
	try {
		localStorage.setItem(appKey, JSON.stringify(settings));
	} catch (error) {
		console.error("設定の保存に失敗しました:", error);
	}
}

function openDialog() {
	G.dialogWindow.showModal();
}
function closeDialog() {
	G.dialogWindow.close();
	G.content.innerHTML = '';
	if (G.entryField.value != '') searchEntry(G.entryField.value);
	G.entryField.focus();
}
function saveDialog() {
	if (Object.values(G.settingsDB).every((value) => value === true)) {
		localStorage.removeItem(G.LOCALSTORAGEKEY);
		alert('初期値と同じ設定なので、ローカルストレージの設定を消去しました。');
	} else {
		saveSettings(G.settingsDB, G.LOCALSTORAGEKEY);
	}
	G.entryField.focus();
}

