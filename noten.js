VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
var div = document.getElementById("NotenTest");
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
// Size our svg:
renderer.resize(200, 200);
// And get a drawing context:
var context = renderer.getContext();
//var stave = new VF.Stave(10, 40, 100);

var AlreadyDrawn = false;					// Wird eine Note angezeigt?

var clef;

var radios = document.getElementsByName('clef');			//Notenschlüssel Radiobuttons
var answers = document.getElementsByName('note');			//Antwort Radiobuttons
	
function starten()
{
	if (AlreadyDrawn == false)
  {
  	stave = new VF.Stave(10, 40, 100);
    clef = getClef();
		stave.addClef(clef).addTimeSignature("4/4");
		drawNote();
    setAnswers();
    AlreadyDrawn = true;
  }
}


function aktualisiere_progressbar() 
{
	if (document.getElementById('fortschritt').value < document.getElementById('fortschritt').max)
	{
  	document.getElementById('fortschritt').value++;
    document.getElementById("NotenTest").style.border = "thick solid #000000";
    sleep(2000).then(() => {
    context.clearRect(0, 0, 200, 200);
    document.getElementById("NotenTest").style.border = "thick solid #FFFFFF";
  //do stuff
})

    //context.clearRect(0, 0, 200, 200);
    AlreadyDrawn = false;
          //hier evtl. neue Aufgabe anzeigen rein
  }
}

function neu_starten()
{
	document.getElementById('fortschritt').value = 0;
  context.clearRect(0, 0, 200, 200);
  AlreadyDrawn = false;
  starten();
  //neue Aufgaben laden könnte hier mit rein
}


function drawNote()
{
	
	stave.setContext(context).draw();
  var notes = [ new VF.StaveNote({clef: clef, keys: [Notenliste.note[0].a], duration: "q" })];

	var voice = new VF.Voice({num_beats: 1,  beat_value: 4});
	voice.addTickables(notes);

	// Format and justify the notes to 400 pixels.
	var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);

	// Render voice
	voice.draw(context, stave);
}

function getClef()
{
	for (var i = 0, length = radios.length; i < length; i++) 
  {
    if (radios[i].checked) 
    {
      return radios[i].value;
    }
	}
}

function setAnswers()
{
	document.getElementById("A1").innerHTML=Notenliste.note[0].l[0];
  document.getElementById("A2").innerHTML=Notenliste.note[0].l[1];
  document.getElementById("A3").innerHTML=Notenliste.note[0].l[2];
  document.getElementById("A4").innerHTML=Notenliste.note[0].l[3];
}

Notenliste = 
{
	"note": [
    {"a":"c/4", "l":["C","D","E","H"]},
    {"a":"d/4", "l":["D","C","G","F"]},
    {"a":"e/4", "l":["D","C","G","F"]},
    ],     
  "akkord3": [
    {"a": "(C4 E4 G4)", "l": ["C", "H", "F", "D"]},
    {"a": "(C4 E4 G3)", "l": ["C", "G", "E", "D"]},
    ]  
}
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
