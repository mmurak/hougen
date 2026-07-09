class GlobalManager {
	constructor() {
		this.tocSel = document.getElementById("TOCSel");
		this.entryField = document.getElementById("EntryField");
		this.content = document.getElementById("Content");
		this.URL = 0;
		this.indexer = {};
		for (let item of contentsIndex) {
			if (item.type == 'S') {
				this.indexer[item.entry] = item.page;
			}
		}
	}
}

const G = new GlobalManager();
const R = new Regulator2026();

const header = document.createElement("option");
header. name = "";
header.value = 0;
G.tocSel.appendChild(header);

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
	const extracted = contentsIndex.filter((x) => {
		return x.entry.startsWith(evt.data);
	});
	if (extracted.length > 0) {
		displayResult(extracted);
	}
});

G.entryField.addEventListener("keydown", (evt) => {
	if (evt.key == 'Escape') {
		 clearEntryField();
	}
});

function clearEntryField() {
	G.entryField.value = '';
	G.content.innerHTML = '';
	G.entryField.focus();
}


G.content.addEventListener('click', (evt) => {
	const target = evt.target.closest('.item');
	if (target) {
		let indexKey = target.textContent;
		const m = indexKey.match(/ ➡ (.+)$/);
		if (m != null) indexKey = m[1];
		window.open(`https://dl.ndl.go.jp/pid/12449295/1/${G.indexer[indexKey]}`, '検索結果');
	}
	G.entryField.focus();
});


function displayResult(extractedList) {
	let result = '';
	for (let item of extractedList) {
		switch (item.type) {
			case 'S' :
				result += `<span class="item" style="color:black;">${item.entry}</span><br>`;
				break;
			case 'G' :
				result += `<span class="item"><span style="color:purple;">${item.entry}</span> ➡ ${item.ref}</span><br>`;
				break;
			case 'M' :
				result += `<span class="item"><span style="color:blue;">${item.entry}</span> ➡ ${item.ref}</span><br>`;
				break;
			case 'E' :
				result += `<span class="item"><span style="color:olive;">${item.entry}</span> ➡ ${item.ref}</span><br>`;
				break;
			default:
		}
	}
	G.content.innerHTML = result;
}


G.entryField.focus();

function tocChange(val) {
	G.content.innerHTML = '';
	if (val == -1)  return;
	G.entryField.value = "";
	G.entryField.focus();
	if (G.tocSel.selectedIndex < 4) {
		windowOpen(preamble[G.URL], val, '付録');
	} else if (val < 0) {
		let anchors = '';
		if (val == -61) {
			for (let item of furoku01) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		} else {
			for (let item of furoku02) {
				anchors += `<a href="javascript:jumpTo(${item[1]})">${item[0]}</a><br>`;
			}
		}
		G.content.innerHTML = anchors;
	} else {
		windowOpen(postamble[G.URL], val, '付録');
	}
}

function windowOpen(url, page, windowType) {
	window.open(url + page, windowType);
	G.entryField.focus();
}

function jumpTo(val) {
	windowOpen(postamble[G.URL], val, '付録');
}
