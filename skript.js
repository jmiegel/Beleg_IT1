'use strict';
var VF = Vex.Flow;
var div = document.getElementById("NotenTest");
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
renderer.resize(200, 200);
var context = renderer.getContext();

var waitForSleep = false;                   //Befindet sich im sleep?
var AlreadyStarted = false;                 //Runde bereits angefangen?

var stave;
var clef;

var AufgabenArray = [0,1,2,3,4,5,6,7,8,9];                //Array zur Random Auswahl der Aufgaben
var AntwortArray = [0,1,2,3];                             //Array zum Random anordnen der Antworten
var AufgabenCounter = 0;

var richtigeAntw = 0;

var clefRadios = document.getElementsByName("clef");			//Notenschl�ssel Radiobuttons
var answerRadios = document.getElementsByName("note");			//Antwort Radiobuttons


function shuffle(array)                                         //Mischt Array zufällig
{
    var tmp, current, top = array.length;

    if(top) while(--top)
    {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
}

const sleep = (milliseconds) =>
{
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


function getRadioInput(InputRadios)                                 //Gibt Wert von checked Radiobutton zurück bzw false
{
    for (var i = 0, length = InputRadios.length; i < length; i++)
    {
        if (InputRadios[i].checked)
        {
            return InputRadios[i].value;
        }
    }
    return false;
}

var Notenliste;/* =
{
    "note": [
    { "a": "c/4", "l": ["C", "D", "E", "B"] },
    { "a": "d/4", "l": ["D", "C", "G", "F"] },
    { "a": "e/4", "l": ["E", "B", "G", "F"] },
    { "a": "f/4", "l": ["F", "A", "G", "E"] },
    { "a": "g/4", "l": ["G", "B", "F", "C"] },
    { "a": "a/4", "l": ["A", "B", "G", "D"] },
    { "a": "b/4", "l": ["B", "C", "A", "D"] },
    { "a": "c/5", "l": ["C", "B", "G", "F"] },
    { "a": "d/5", "l": ["D", "A", "E", "C"] },
    { "a": "e/5", "l": ["E", "B", "A", "F"] },
    ],
    "akkord3": [
      { "a": "(C4 E4 G4)", "l": ["C", "H", "F", "D"] },
      { "a": "(C4 E4 G3)", "l": ["C", "G", "E", "D"] },
    ]
}*/

function getAufgabenBlock()
{
    AntwortArray = shuffle(AntwortArray);
    var num = AntwortArray[0] + 1;
    var file = "./noten"+num+".json";
    loadBlock(file);
}

function loadBlock(file) 
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200)
            Notenliste = JSON.parse(this.responseText);
    };
    xhttp.open("GET", file, true);
    xhttp.send();
}



function onClick_Start()
{
  //hier nochmal weiß-zeichnen des quadrats eingefügt, damit die erste note schon einen weißen hintergrund hat
    context.clearRect(0, 0, 200, 200);
    document.getElementById("NotenTest").style.border = "thick solid #FFFFFF";

    getAufgabenBlock();
    
    sleep(10).then(() =>
    {
        if (AlreadyStarted) neu_starten();
        else
        {
            AufgabenArray = shuffle(AufgabenArray);
            AntwortArray = shuffle(AntwortArray);
            starten();
        }
    })
}


function starten()
{
    stave = new VF.Stave(10, 40, 100);
    clef = getRadioInput(clefRadios);
    stave.addClef(clef).addTimeSignature("4/4");

    drawNote();

    document.getElementById("starten").textContent = "Neustart";
    document.getElementById("Auswertung").innerHTML = "";
    AlreadyStarted = true;
}


function neu_starten()
{
    if (!waitForSleep)
    {
        document.getElementById("fortschritt").value = 0;
        document.getElementById("Auswertung").innerHTML = "";
        context.clearRect(0, 0, 200, 200);
        document.getElementById("NotenTest").style.border = "thick solid #FFFFFF";
        answerRadios[0].checked = false;
        answerRadios[1].checked = false;
        answerRadios[2].checked = false;
        answerRadios[3].checked = false;
        AlreadyStarted = false;
        AufgabenCounter = 0;
        richtigeAntw = 0;

        AufgabenArray = shuffle(AufgabenArray);
        AntwortArray = shuffle(AntwortArray);

        starten();
    }
}


function aktualisiere_progressbar()
{
    if (!AlreadyStarted)
    {
        document.getElementById("Auswertung").innerHTML = "Es muss eine Runde gestartet werden um Aufgaben zu lösen!";
        return;
    }

    if (document.getElementById("fortschritt").value == document.getElementById('fortschritt').max)     //Nach 10 Aufgaben
    {
        document.getElementById("Auswertung").innerHTML =
        "Du hast "+richtigeAntw+" von 10 Aufgaben richtig gelöst! Drücke auf Neustart um weitere Aufgaben zu lösen.";
        return;
    }

    if (document.getElementById("fortschritt").value < document.getElementById('fortschritt').max)
    {
        if (!getRadioInput(answerRadios))                                                               //Nichts ausgewählt
        {
            document.getElementById("Ankreuzen").innerHTML = "Bitte eine Antwort auswählen";
            return;
        }
        else if (getRadioInput(answerRadios) == Notenliste.note[AufgabenArray[AufgabenCounter]].l[0])   //Antwort richtig
        {
            document.getElementById("NotenTest").style.border = "thick solid #78BD70";
            richtigeAntw++;
        }
        else                                                                                            //Antwort falsch
            document.getElementById("NotenTest").style.border = "thick solid #D65076";

        document.getElementById("Ankreuzen").innerHTML = "";
        document.getElementById("fortschritt").value++;

        if (document.getElementById("fortschritt").value == document.getElementById('fortschritt').max)     //beim 10. lösen
        {
            document.getElementById("Auswertung").innerHTML = "Du hast "+richtigeAntw+" von 10 Aufgaben richtig gelöst!";
            return;
        }

        waitForSleep = true;

        sleep(1000).then(() =>
        {
            context.clearRect(0, 0, 200, 200);
            document.getElementById("NotenTest").style.border = "thick solid #FFFFFF";

            answerRadios[0].checked = false;
            answerRadios[1].checked = false;
            answerRadios[2].checked = false;
            answerRadios[3].checked = false;

            AufgabenCounter++;

            waitForSleep = false;
            starten();
        })
        //hier evtl. neue Aufgabe anzeigen rein
    }
}


function drawNote()
{

    stave.setContext(context).draw();
    var notes = [new VF.StaveNote({ clef: clef, keys: [Notenliste.note[AufgabenArray[AufgabenCounter]].a], duration: "w" })];

    var voice = new VF.Voice({ num_beats: 1, beat_value: 1 });
    voice.addTickables(notes);

    // Format and justify the notes to 400 pixels.
    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);

    // Render voice
    voice.draw(context, stave);
    setAnswers();
}


function setAnswers()
{
    AntwortArray = shuffle(AntwortArray);

    document.getElementById("A1").innerHTML = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[0]];
    answerRadios[0].value = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[0]];

    document.getElementById("A2").innerHTML = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[1]];
    answerRadios[1].value = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[1]];

    document.getElementById("A3").innerHTML = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[2]];
    answerRadios[2].value = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[2]];

    document.getElementById("A4").innerHTML = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[3]];
    answerRadios[3].value = Notenliste.note[AufgabenArray[AufgabenCounter]].l[AntwortArray[3]];

}