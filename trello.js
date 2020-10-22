var draggingCard;
var targetBoard;
var onBoard = false;
var helper;
var helperTrans;
var pos;

var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet.insertRule('body {
	font-family: "Source Sans Pro", "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
    padding: 16px;
    color: #3C3C3C;
    font-size: 14px;
    margin: 0;
}

.panel-header .panel-title {
    font-size: 18px;
    color: #3171B2;
    font-weight: 700;
    font-family: inherit;
    padding-top: 1px;
}

.panel-header .panel-desc {
    font-size: 13px;
    color: #1C2E36;
    display: block;
}

.panel-header {
    padding: 0 0 6px;
    border-bottom: 1px solid #D8D8D8;
    position: relative;
}

.panel-body {
	height: calc(100vh - 105px);
	margin: 0 -5px;
    padding: 15px 0;
}

.list {
	margin: 0 5px;
	display: inline-block;
	width: 200px;
	/* padding: 8px; */
	vertical-align: top;
	position: relative;
	z-index: 1;
	height: 100%;
}

.list > .title {
	font-weight: bold;
	display: block;
	/* padding-bottom: 6px; */
	position: absolute;
	top: 8px;
	left: 8px;
}

.list > .task-list {
	list-style: none;
	padding: 34px 8px 34px 8px;
	margin: 0;
	background-color: #e2e4e6;
	border-radius: 3px;
}

.list > .task-list li {
	background-color: white;
	padding: 5px;
	border-radius: 3px;
	/* margin-top: 6px; */
	margin-bottom: 6px;
	width: 184px;
	z-index: 2;
	box-sizing: border-box;
}

.list > .task-list li#card-helper {
	position: fixed;
	pointer-events: none;
}

.list > .task-list li.clone {
	/* background-color: red; */
	/* z-index: 3 !important; */
}

.list > .task-list li.card-ghost {
	background-color: #C4C9CC;
	pointer-events: none;
}

.list > .task-list li.dragging-card {
	position: absolute;
	opacity: 0;
	/*pointer-events: none;*/
}

.list > .task-list li:hover {
	cursor: pointer;
	background-color: #EDEFF0;
}

.list .add-card-btn {
	display: block;
	padding: 8px 10px;
	color: #838c91;
	position: relative;
	top: -32px;
	border-radius: 0 0 3px 3px;
	/*margin-top: -6px;*/
}

.list .add-card-btn:hover {
    background-color: #cdd2d4;
    color: #4d4d4d;
    text-decoration: underline;
    cursor: pointer;
}

/* Prevent the text contents of draggable elements from being selectable. */
[draggable] {
	-moz-user-select: none;
	-khtml-user-select: none;
	-webkit-user-select: none;
	user-select: none;
	/* Required to make elements draggable in old WebKit */
	-khtml-user-drag: element;
	-webkit-user-drag: element;
}');

function onDragStart (e) {
	// var helper = this.cloneNode(true);
	// document.getElementById("panel-body").appendChild(helper);
	draggingCard = this;
	targetBoard = this.parentElement;
	helper = draggingCard.cloneNode(true);
	draggingCard.className = draggingCard.className + " dragging-card";

	helper.id = "card-helper";
	var boards = document.querySelectorAll('ul.task-list');
	boards[boards.length - 1].appendChild(helper);
	helperTrans = {
		x: e.clientX - draggingCard.getBoundingClientRect().left,
		y: e.clientY - draggingCard.getBoundingClientRect().top
	};
	helper.style.left = (e.clientX - helperTrans.x) + "px";
	helper.style.top = (e.clientY - helperTrans.y) + "px";

	var cards = document.querySelectorAll('ul.task-list li, .list a.add-card-btn');
	[].forEach.call(cards, function(card) {
		if (card != draggingCard)
			card.style.pointerEvents = "none";
	});
	onBoard = true;
}

function onDrag (e) {
	// destroys old placeholder
	var placeholder = document.getElementById("card-placeholder");
	if (placeholder) placeholder.parentNode.removeChild(placeholder);

	// creates new placeholder object
	var placeholder = document.createElement("li");
	placeholder.id = "card-placeholder";
	placeholder.className = "card-ghost";
	placeholder.style.height = draggingCard.getBoundingClientRect().height + "px";

	pos = getBoardPosition(targetBoard, e.clientY);
	
	if (pos < targetBoard.children.length) targetBoard.insertBefore(placeholder, targetBoard.children[pos]);
	else targetBoard.appendChild(placeholder);

	helper.style.left = (e.clientX - helperTrans.x) + "px";
	helper.style.top = (e.clientY - helperTrans.y) + "px";
}

function onDragEnter (e) {
	targetBoard = this.querySelector("ul.task-list");
	onBoard = true;
}

function onDragLeave (e) {
	onBoard = false;
}

function onDragEnd (e) {
	var placeholder = document.getElementById("card-placeholder");
	if (placeholder) placeholder.parentNode.removeChild(placeholder);
	draggingCard.className = draggingCard.className.replace("dragging-card", "").trim();

	var clone = draggingCard.cloneNode(true);
	
	helper.parentElement.removeChild(helper);
	draggingCard.parentElement.removeChild(draggingCard);
	var pos = getBoardPosition(targetBoard, e.clientY);
	if (pos < targetBoard.children.length) targetBoard.insertBefore(clone, targetBoard.children[pos]);
	else targetBoard.appendChild(clone);
	configCardElement(clone);

	var cards = document.querySelectorAll('ul.task-list li, .list a.add-card-btn');
	[].forEach.call(cards, function(card) {
		card.style.pointerEvents = "auto";
	});
}

function getBoardPosition (board, yPosition) {
	var boardCards = board.querySelectorAll('li:not(card-helper)');
	var i = 0;
	[].forEach.call(boardCards, function(card) {
		var rect = card.getBoundingClientRect();
		if (yPosition > rect.top + rect.height) i++;
	});
	return i;
}

var cards = document.querySelectorAll('.task-list li');
[].forEach.call(cards, function(card) {
	configCardElement(card);
});

function configCardElement (card) {
	card.addEventListener('dragstart', onDragStart, false);
	card.addEventListener('drag', onDrag, false);
	card.addEventListener('dragend', onDragEnd, false);
}

var boards = document.querySelectorAll('.list');
[].forEach.call(boards, function(board) {
	board.addEventListener('dragenter', onDragEnter, false);
	board.addEventListener('dragleave', onDragLeave, false);
});