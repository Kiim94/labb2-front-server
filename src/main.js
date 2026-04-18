import './style.scss'

console.log("Script laddat!");

//url till api-server
/*Hade denna vid test lokalt:
const apiUrl = "http://localhost:3000/api/works";*/
const apiUrl = "https://labb2-webserver.onrender.com/api/works";

//ul elementet på index.html
const list = document.getElementById("work-list");

//på index.html
const errorDiv = document.getElementById("error");

//på add-html
const addErr = document.getElementById("add-err");

//formulär från add.html
const form = document.getElementById("workForm");


//funktion för att göra "korrekt" datum
//om inget datum finns valt, returnera - - - 
//annars, returnera datum i svenskt format: ändra själva utseendet till mer "förståeligt" för människor
function formatDate(dateString) {
    if (!dateString){
        return " ";
    }
    return new Date(dateString).toLocaleDateString("sv-SE");
}
//funktion för att göra GET anrop - hämta lagrade arbeten
async function getWorks(){
        if(!list){
            return;
        }

        try{
        const res = await fetch(apiUrl);
        if(!res.ok){
            errorDiv.textContent = "Kunde inte hämta sparade arbeten: finns det några sparade?";
            return;
        }
        const data = await res.json();

        list.innerHTML = "";
        //loopa igenom json responsen och skapa element, skapa "rätt" datum, skapa delete knapp och append till li element.
        //Om ngt går fel, visa meddelande i html
        data.forEach(work => {
            const li = document.createElement("li");
            li.classList.add("block");
            
            const start = formatDate(work.start_date);
            const end = formatDate(work.end_date);

            //skapa variabler för de olika punkterna, sedan append för att flytta alla in i li
            const title = document.createElement("h3");
            title.textContent = work.company + " - " + work.jobtitle;

            const dates = document.createElement("h4");
            dates.style.fontStyle="italic"
            dates.textContent = "Från: " + start + " - Till: " + end;

            const describe = document.createElement("p");
            describe.textContent = work.description;

            li.append(title, dates, describe);
            
            //lägg till radera knapp. Hade denna under tidigare, valde att bryta ut den
            /*const delBtn = document.createElement("button");
            delBtn.textContent = "Radera";
            delBtn.addEventListener("click", () => {
                deleteWork(work.id);
            })*/
            const delBtn = deleteButton(work.id);
            delBtn.classList.add("delBtn");
            li.appendChild(delBtn);
            list.appendChild(li);
        })
    }catch(err){
        console.error("Fel vid hämtning av arbeten:", err);
        
        if(list){
            const p = document.createElement("p");
            p.textContent = "Kunde inte hämta datan!";
            list.appendChild(p);
        }
    }
}

function deleteButton(workID){
    const delBtn = document.createElement("button");
    delBtn.textContent = "Radera";
    delBtn.addEventListener("click", () => {
        deleteWork(workID)
    })
    return delBtn;
}

//if(form) - kontroll av ifall form verkligen existerar
// form finns bara på en html sida, men alla 3 använder samma JS-fil
// för att undvika eventuella fel (vissa getElementById finns inte på alla sidor t.ex.) så används if
function initiateForm(){
    if(!form){
        return;
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const company = document.getElementById("company").value.trim();
        const jobtitle = document.getElementById("jobtitle").value.trim();
        const start_date = document.getElementById("start_date").value;
        const end_date = document.getElementById("end_date").value;
        const description = document.getElementById("description").value.trim();
        
        //om antingen copmpany eller jobtitle är tom, avbryt kod här o returnera en varning:
        if(!company || !jobtitle){
            addErr.innerHTML = "";
            const p = document.createElement("p");
            p.textContent= "Kom ihåg att fylla i både arbetsplats och namn på ditt arbete!"
            p.style.color="crimson";
            p.style.fontWeight = "bold";
            addErr.appendChild(p);
            return;
        }
        //om det valda end_date som matchas med nutida datum, är mindre (alltså tidigare) än start_date, avbryt o returnera en varning
        if(end_date && new Date(end_date) < new Date(start_date)){
            addErr.innerHTML = "";
            const p = document.createElement("p");
            p.textContent = "Slutdatum kan inte vara innan start!";
            p.style.color = "crimson";
            p.style.fontWeight = "bold";
            addErr.appendChild(p);
            return;
        }
        const fetchValues = {
            company: company,
            jobtitle: jobtitle,
            start_date: start_date,
            end_date: end_date,
            description: description,
        };
            
        await fetch(apiUrl,{
            method: "POST",
            //tala om för server: innehållet i requestens body är JSON
            headers: {
                "Content-Type": "application/json"
            },
            //gör JS-objekt till JSON-sträng
            body: JSON.stringify(fetchValues)
        });
        form.reset();
        addErr.innerHTML = "";
        getWorks();
    })
}

//DELETE. En confirm för att kunna stanna upp o kontrollera om användare vill radera
async function deleteWork(id){
    errorDiv.textContent = "";
    try{
        if(!confirm("Vill du verkligen radera?")) return;
        console.log("Radera id: ", id);
        const res = await fetch(apiUrl + "/" + id, {
            method:"DELETE"
        })
        if(!res.ok){
            errorDiv.textContent = "Kunde inte radera arbetet.";
            return;
        }
        console.log("Raderat!")
        getWorks();
    }catch(err){
        console.error("Delete misslyckades: ", err);
        errorDiv.textContent = "Tyvärr kunde arbetet inte raderas - något kan vara fel med nätverket."
    }
}

//kalla på funktioner!
initiateForm();
getWorks();
