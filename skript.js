'use strict';
var VF = Vex.Flow;
var div = document.getElementById("NotenTest");
var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
renderer.resize(200, 200);
var context = renderer.getContext();         //VexFlow grundlegendes Setup

var waitForSleep = false;                   //Befindet sich im sleep?
var AlreadyStarted = false;                 //Runde bereits angefangen?
var NoteEasyScore = false;                  //Befindet sich die aktuelle Notenlisten im Easyscore-System

var stave;
var clef;

var AufgabenArray;                          //Array zur Random Auswahl der Aufgaben
var AntwortArray = [0,1,2,3];               //Array zum Random anordnen der Antworten
var AufgabenCounter = 0;
var richtigeAntw = 0;
var Notenliste =
{
   "note":[
      {
         "a":"c/4",
         "l":["C","D","E","H"]
      },
      {
         "a":"d/4",
         "l":["D","C","G","F"]
      },
      {
         "a":"e/4",
         "l":["E","H","G","F"]
      },
      {
         "a":"f/4",
         "l":["F","A","G","E"]
      },
      {
         "a":"g/4",
         "l":["G","H","F","C"]
      },
      {
         "a":"a/4",
         "l":["A","H","G","D"]
      },
      {
         "a":"b/4",
         "l":["H","C","A","D"]
      },
      {
         "a":"c/5",
         "l":["C","H","G","F"]
      },
      {
         "a":"d/5",
         "l":["D","A","E","C"]
      },
      {
         "a":"e/5",
         "l":["E","H","A","F"]
      }]
};

var clefRadios = document.getElementsByName("clef");			//Notenschluessel Radiobuttons
var answerRadios = document.getElementsByName("note");		//Antwort Radiobuttons


function shuffle(array)                                   //Mischt Array zufällig
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


function getRadioInput(InputRadios)              //Gibt Wert von checked Radiobutton zurück bzw false
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

function parseNote()                            //Note aus NotenListe lesen
{
    var Note;
    if (NoteEasyScore)                          //Noten von Easyscore übersetzen
    {
        if (clef == "treble")
            Note = Notenliste.note[AufgabenArray[AufgabenCounter]].a[0].toLowerCase() + "/"
            + Notenliste.note[AufgabenArray[AufgabenCounter]].a[1];
        if (clef == "bass")
        {
            var val = Notenliste.note[AufgabenArray[AufgabenCounter]].a[1] - 2;
            Note = Notenliste.note[AufgabenArray[AufgabenCounter]].a[0].toLowerCase() +"/"+ val;
        }
    }
    else                                        //Noten ohne Easyscore lesen
    {
        if (clef == "treble")
        {
            Note = Notenliste.note[AufgabenArray[AufgabenCounter]].a;
        }
        if (clef == "bass")
        {
            var val = Notenliste.note[AufgabenArray[AufgabenCounter]].a[2] - 2;
            Note = Notenliste.note[AufgabenArray[AufgabenCounter]].a[0] +"/"+ val;
        }
    }
    return Note;
}

function initArray(Array)                       //Füllt Array mit Zahlen entsprechend der Anzahl der Aufgaben (0,1,....,n)
{
    var initAr = [];
    for (var i = 0; i < Array.length; i++)
    {
        initAr[i] = i;
    }
    return initAr;
}

//----------------------------AJAX----------------------------------------------


function getXhr()
{ // API für asynchrone Aufrufe
    if (window.XMLHttpRequest)
    {
        var xhr = new XMLHttpRequest();
        return xhr;
        } else return false;
}

function sendXhr()
{
    xhr.onreadystatechange = xhrHandler;
    xhr.open('GET', "http://idefix.informatik.htw-dresden.de/it1/beleg/noten-aufgaben.js", true);
    xhr.send(null);
    console.debug("Request send");
}

function xhrHandler()
{
    console.log( "Status: " + xhr.readyState );
    if (xhr.readyState != 4) { return; }
    console.log( "Status: " + xhr.readyState + " " + xhr.status);
    if (xhr.status == 200)
    {
        Notenliste = JSON.parse(xhr.responseText);
        NoteEasyScore = true;
        document.getElementById("AufgabenAjax").innerHTML ="Aufgaben wurden erfolgreich geladen."
    }
}

var xhr = getXhr();


//------------------------------------------------------------------------------


function onClick_Start()
{
    context.clearRect(0, 0, 200, 200);
    document.getElementById("NotenTest").style.border = "thick solid #FFFFFF";

    AufgabenArray = initArray(Notenliste.note);

    if (AlreadyStarted) neu_starten();               //Starten nachdem bereits eine Runde angefangen wurde
    else
    {
    	AufgabenArray = shuffle(AufgabenArray);        // 1. Starten zB bei neuladen
        AntwortArray = shuffle(AntwortArray);
        starten();
    }
}


function starten()
{
    stave = new VF.Stave(10, 40, 100);
    clef = getRadioInput(clefRadios);
    stave.addClef(clef).addTimeSignature("4/4");

    var Note = parseNote();
    drawNote(Note);

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
        document.getElementById("Auswertung").innerHTML = "Es muss eine Runde gestartet werden um Aufgaben zu lösen!<br><br>";
        return;
    }

    if (document.getElementById("fortschritt").value == document.getElementById('fortschritt').max)     //Nach 10 Aufgaben
    {
        document.getElementById("Auswertung").innerHTML =
        "<br>Du hast <b>"+richtigeAntw+" von 10</b> Aufgaben richtig gelöst!</br>Drücke auf Neustart um weitere Aufgaben zu lösen.<br><br>";
        return;
    }

    if (document.getElementById("fortschritt").value < document.getElementById('fortschritt').max)
    {
        if (!getRadioInput(answerRadios))                                                                //Nichts ausgewählt
        {
            document.getElementById("Ankreuzen").innerHTML = "<br>Bitte eine Antwort auswählen<br>";
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
            document.getElementById("Auswertung").innerHTML =
	    "<br>Du hast <b>"+richtigeAntw+" von 10</b> Aufgaben richtig gelöst!</br>Drücke auf Neustart um weitere Aufgaben zu lösen.<br><br>";
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
    }
}


function drawNote(note)
{
    stave.setContext(context).draw();
    var notes = [new VF.StaveNote({ clef: clef, keys: [note], duration: "w" })];

    var voice = new VF.Voice({ num_beats: 1, beat_value: 1 });
    voice.addTickables(notes);

    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);

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
