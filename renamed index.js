const select1 = document.getElementById("NoOfPassenger");
const select2 = document.getElementById("luggageType");
const select3 = document.getElementById("Amount");
const warning = document.getElementById("warning");
const vehicleCard = document.getElementById("vehicleCard");
const suggestedCar = document.getElementById("suggestedCar");
const carImg = document.getElementById("carImg");
const suggestedCarText = document.getElementById("suggestedCarText");
const rows = document.getElementById("rows");
const Array_Luggage = [];
$(document).ready(function(){
    $.get("https://ots-vehicles.j.layershift.co.uk/luggage/presets",function(response){
        var luggage_array = response.data;
        luggage_array.forEach(element => {
            Array_Luggage.push(element);
        });
        for(let i = 0; i < Array_Luggage.length; i++) {
            let opt = Array_Luggage[i].name; 
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = Array_Luggage[i].id;
            select2.appendChild(el);
        }
        for(let i = 0; i < 9; i++) {
            let opt = i.toString();
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select1.appendChild(el);
        }
        let el = document.createElement("option");
            el.textContent = `9+`;
            el.value = `9`;
            select1.appendChild(el);
        
        for(let i = 0; i <= 50; i++) {
            let opt = i.toString();
            let el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select3.appendChild(el);
        }
    })
})



function hideVehicleCard(){
    $("#vehicleCard").slideUp("slow");
}

function showVehicleCard(){
    $("#vehicleCard").slideDown("slow");
}

function hideWarning(){
    $("#warning").slideUp("slow");
    hideVehicleCard();
}

function showWarning(){
    hideWarning();
    warning.innerHTML = "Your journey must have at least one passenger";
    $("#warning").slideDown("slow");
    hideVehicleCard();
}

function showWarning1(row){
    hideWarning();
    warning.innerHTML = `There is an Amount of Luggage in ${row} but no Luggage Type Selected`;
    $("#warning").slideDown("slow");
    hideVehicleCard();
}

function showWarning2(luggageWarning,row){
    hideWarning();
    warning.innerHTML = `The luggage Amount for ${luggageWarning} needs to be one or more in ${row}`;
    $("#warning").slideDown("slow");
    hideVehicleCard();
}

function showWarning3(row){
    hideWarning();
    warning.innerHTML = `The ${row} has No Luggage Type and Amount Selected Delete this ${row} to proceed`;
    $("#warning").slideDown("slow");
    hideVehicleCard();
}

function getLuggage(Amount,lug_type){
    let lug_array = [];
    if (Amount.length == 1 && lug_type == "None")
    {
        index = 1;
        return Array_Luggage[index];
    }
    for(let i=0;i<Amount.length;i++)
    {
        Array_Luggage[lug_type[i]].quantity = Amount[i];
        lug_array.push(Array_Luggage[lug_type[i]]);
    }
    return lug_array;
}

const addRow = () => {
    let count = rows.childElementCount;
    const row = document.getElementById("row1").cloneNode(true);
    row.id = `row${count+1}`;
    row.children[2].children[0].disabled = false;
    row.querySelector("#del").addEventListener(
        "click",
        function() {
            row.remove()
        }
    )
    rows.appendChild(row);
}

function myFunction(){
    hideWarning();
    let passengers = select1.options[select1.selectedIndex].value;
    let noOfRows = rows.childElementCount;
    let selected_luggage = [];
    let lug_type = [];
    let  amount_type = [];
    if(passengers === "Select Passengers (incl. infants)" || passengers == 0){
        showWarning();
        return;
    }
    else
    {
        for(let i=1; i<=noOfRows;i++)
        {
            let selectedRow = document.getElementById(`row${i}`).children[0].children[0];
            let selectedAmount = document.getElementById(`row${i}`).children[1].children[0];
            let luggageType = selectedRow.options[selectedRow.selectedIndex].value;
            let luggageWarning = selectedRow.options[selectedRow.selectedIndex].text;
            let Amount = parseInt(selectedAmount.options[selectedAmount.selectedIndex].text);
            if(Amount > 0 && luggageType == "None")
            {
                showWarning1(`Row ${i}`);
                console.log('1')
                return;
            }
            else if(Amount == 0 && luggageType != "None")
            {
                showWarning2(luggageWarning,`Row ${i}`);
                console.log('2')
                return;
            }
            else if(i>1 && Amount == 0 && luggageType == "None")
            {
                showWarning3(`Row ${i}`);
                console.log('3')
                return;
            }
            lug_type.push(luggageType);
            amount_type.push(Amount);
        }
        selected_luggage = getLuggage(amount_type,lug_type);
        $.post(`https://ots-vehicles.j.layershift.co.uk/vehicle/suggest-for/${passengers}`, {luggage:selected_luggage},function(Object_response)
        {
            let vehicle_array = [];
            Object_response.data.forEach(element => {
            vehicle_array.push(element);
            });
            var suggested_vehicle = vehicle_array[0];
            hideWarning();
            carImg.src = `https://www.airporttaxis-uk.co.uk/images/icon-vehicle-${(suggested_vehicle.legacy_id || 0)}-light.svg`;
            if(suggested_vehicle.name == "Other Vehicle")
            {
                suggestedCar.innerHTML = `MULTIPLE VEHICLES <span style="font-weight: lighter;">Suggested</span>`;
                suggestedCarText.innerHTML = `Unfortunately no single vehicle in our fleet can accommodate your ${passengers}+ passengers passengers and luggage, we suggest splitting your journey across multiple vehicles`;
            }
            else
            {
                suggestedCar.innerHTML = `${suggested_vehicle.name} <span style="font-weight: lighter;">Suggested</span>`;
                suggestedCarText.innerHTML = `We suggest that a ${suggested_vehicle.name} is the minimum size vehicle we can recommend for your ${passengers} passengers and luggage combination.`;
            }
            showVehicleCard();
        });
    }
}