// ==========================
// PS99 RAP Monitor Pro
// ==========================

const itemContainer = document.getElementById("itemContainer");
const searchInput = document.getElementById("search");

const sampleData = [
{
    name:"Huge Lucky Cat",
    rap:620000,
    previous:480000,
    type:"Huge",
    image:"https://placehold.co/300x300?text=Huge+Lucky+Cat"
},
{
    name:"Titanic Blobfish",
    rap:1280000000,
    previous:1200000000,
    type:"Titanic",
    image:"https://placehold.co/300x300?text=Titanic"
},
{
    name:"Chest Mimic",
    rap:9500000,
    previous:5200000,
    type:"Item",
    image:"https://placehold.co/300x300?text=Item"
}
];

let items = sampleData;

function formatNumber(num){

    if(num>=1000000000)
        return (num/1000000000).toFixed(2)+"B";

    if(num>=1000000)
        return (num/1000000).toFixed(2)+"M";

    if(num>=1000)
        return (num/1000).toFixed(2)+"K";

    return num;
}

function inflation(item){

    return ((item.rap-item.previous)/item.previous)*100;
}

function render(list){

    itemContainer.innerHTML="";

    document.getElementById("totalItems").textContent=list.length;

    let inflated=0;

    list.forEach(item=>{

        const percent=inflation(item);

        let badge="Normal";
        let color="badge-normal";

        if(percent>=20){

            badge="Inflated";

            color="badge-inflated";

            inflated++;

        }

        itemContainer.innerHTML+=`

<div class="col-md-4 col-lg-3 item-card">

<div class="card">

<img src="${item.image}">

<div class="card-body">

<div class="item-name">

${item.name}

</div>

<div class="text-secondary">

${item.type}

</div>

<div class="item-rap">

💎 ${formatNumber(item.rap)}

</div>

<div class="mt-2">

<span class="badge ${color}">

${badge}

</span>

</div>

<div class="mt-2">

${percent.toFixed(1)}%

</div>

</div>

</div>

</div>

`;

    });

    document.getElementById("inflatedItems").textContent=inflated;

    document.getElementById("updatedTime").textContent=
    new Date().toLocaleTimeString();

}

render(items);

searchInput.addEventListener("input",()=>{

    const value=searchInput.value.toLowerCase();

    render(

        items.filter(i=>

            i.name.toLowerCase().includes(value)

        )

    );

});
