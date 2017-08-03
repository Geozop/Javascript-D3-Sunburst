/*global d3*/
/*global selectedStates*/
console.log("running script.js");

var selectedStates = ["New York"];

// window sizes
var width = window.innerWidth - 20; // extra margin from browser view borders
height = Math.min(width, window.innerHeight + 350)

// vis sizes, calculated with borders
var widthb = width / 2 - 20;
var heightb = height / 2 - 20;

// graphic drawing area
var svg = d3.select('#sunburst').append('svg').attr('width', width / 2).attr('height', height / 2);

// draw gray background
svg.append('rect').attr('width', width).attr('height', height).attr('fill', 'Gainsboro');

// group to control all sunburst objects, gives a gray "background" border
var sunburstgroup = svg.append('g').attr('transform', 'translate(10, 10)');

// initial white square
sunburstgroup.append('rect').attr('width', widthb).attr('height', heightb).attr('fill', 'White');



// --- --- --- Sunburst stuff --- --- ---



var radius = heightb / 2 - 30; // some room for text (however, font size is not well-controlled)

var innerarc = d3.arc()
    .outerRadius(radius / 3)
    .innerRadius(0)
    .cornerRadius(3);

var middlearc = d3.arc()
    .outerRadius(2 * radius / 3 - 2)
    .innerRadius(radius / 3 + 2)
    .cornerRadius(3);

var outerarc = d3.arc()
    .outerRadius(radius)
    .innerRadius(2 * radius / 3)
    .cornerRadius(3);

// group for just the pie slices
var arcgroup = sunburstgroup.append('g').attr('transform', 'translate(' + (widthb / 2) + ', ' + (widthb / 2) + ')');

// give colors to pie slices based on industry sector or other attributes
function arccolors(code) {
    var second = '00', third = '00';
    if (code.length === 4)
    {
        if (code[3] == 9)
        {
            return '#AAAAAA'; // "Misc" category is gray
        } else {
            second = 11 * code[2];
            third = '66';
        }
    } else if (code.length === 3)
    {
        second = '44';
        third = 11 * code[2];
    } else // length == 2
    {
        second = '22';
        third = '22';
    }

    // main color based on sector (just chose patterns that looked all right)
    if (code[1] == '3')
        return ('#' + second) + third + 'F0';
    else if (code[1] == '2')
        return ('#F0' + second) + third;
    else if (code[1] == '1')
        return '#' + second + 'F0' + third;

    console.log(code);
    return '#000000';
}

var sunburstlabel1 = sunburstgroup.append('text')
    .attr('class', 'sunburstlabel1')
    .attr('x', widthb / 2).attr('y', 20)
    .attr('text-anchor', 'middle');
    // .text('[Please select a state]');

var sunburstlabel2 = sunburstgroup.append('text')
    .attr('class', 'sunburstlabel2')
    .attr('x', widthb / 2).attr('y', 40)
    .attr('text-anchor', 'middle');

var hidemissing = false;
d3.select('#sunburstbutton1')
    .on('click', function(d) {
        if (hidemissing = !hidemissing)
        {
            // turning off
            d3.select(this).text("Show Missing Data");
            UpdateSunburst();
        } else {
            // turning on
            d3.select(this).text("Hide Missing Data");
            UpdateSunburst();
        }
    });

var options = [{value:'emp', text:'Employee count'},{value:'ann_pay', text:'Total Annual Pay'},{value:'prod_avg', text:'Workers'},{value:'prod_ann_h', text:'Workers Annual Hours'},{value:'prod_ann_w', text:'Workers Annual Wages'},{value:'mat_cost', text:'Materials Cost'},{value:'ship_val', text:'Shipment Value'},{value:'val_added', text:'Value Added'},{value:'total_exp', text:'Total Expenditures'}];
d3.select('#sunburstoption').selectAll('option').data(options).enter().append('option').attr('value', function(d, i){return d.value;}).text(function(d, i){return d.text;});

var stateoptions = [{value:'NY', text:'New York'},{value:'AL', text:'Alaska'},{value:'CA', text:'California'},{value:'TX', text:'Texas'},{value:'FL', text:'Florida'},{value:'HI', text:'Hawaii'},{value:'MI', text:'Michigan'},{value:'All', text:'All States'}];
d3.select('#sunburststate').selectAll('option').data(stateoptions).enter().append('option').attr('value', function(d, i){return d.value;}).text(function(d, i){return d.text;});

var sunburstdatalabelprefix = "";
var sunburstdatalabelsuffix = " employees";

// add options to "Data type" dropdown
d3.select('#sunburstoption')
    .on('change', function(d, i) {
        var type = d3.select(this).property('value');
        if (type == 'emp')
        {
            sunburstdatalabelprefix = "";
            sunburstdatalabelsuffix = " employees";
        }
        else if (type == 'ann_pay')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }
        else if (type == 'prod_avg')
        {
            sunburstdatalabelprefix = "";
            sunburstdatalabelsuffix = " workers";
        }
        else if (type == 'prod_ann_h')
        {
            sunburstdatalabelprefix = "";
            sunburstdatalabelsuffix = ",000 hours";
        }
        else if (type == 'prod_ann_w')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }
        else if (type == 'mat_cost')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }
        else if (type == 'ship_val')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }
        else if (type == 'val_added')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }
        else if (type == 'total_exp')
        {
            sunburstdatalabelprefix = "$";
            sunburstdatalabelsuffix = ",000";
        }

        UpdateSunburst();
    });

// add options to "State" dropdown
d3.select('#sunburststate')
    .on('change', function(d, i) {
        var type = d3.select(this).property('value');
        if (type == 'All')
        {
            selectedStates = ['United States'];
            //selectedStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
        } else if (type == 'CA') {
            selectedStates = ['California'];
        } else if (type == 'TX') {
            selectedStates = ['Texas'];
        } else if (type == 'FL') {
            selectedStates = ['Florida'];
        } else if (type == 'AL') {
            selectedStates = ['Alaska'];
        } else if (type == 'MI') {
            selectedStates = ['Michigan'];
        } else if (type == 'HI') {
            selectedStates = ['Hawaii'];
        } else if (type == 'NY') {
            selectedStates = ['New York'];
        }
        UpdateSunburst();
    });

// which field of the datum does the user want?
var pie = d3.pie().sort(null).value(function(d) {
    if ((typeof d) == 'undefined') return -1;

    var type = d3.select('#sunburstoption').property('value');

    if (type == 'emp')
        return d.emp;
    if (type == 'ann_pay')
        return d.ann_pay;
    if (type == 'prod_avg')
        return d.prod_avg;
    if (type == 'prod_ann_h')
        return d.prod_ann_h;
    if (type == 'prod_ann_w')
        return d.prod_ann_w;
    if (type == 'mat_cost')
        return d.mat_cost;
    if (type == 'ship_val')
        return d.ship_val;
    if (type == 'val_added')
        return d.val_added;
    if (type == 'total_exp')
        return d.total_exp;

});



// --- --- --- End Sunburst --- --- ---



// --- --- --- Begin parse file into heirarchy --- --- ---


// main multidimensional array
// statedata["Utah"].id3s["311"] is the data object of values for industry code "311" from Utah ("Food manufacturing")
// statedata["Ohio"].id4s["3112"] is the data object of values for industry code "3112" from Ohio ("Grain and oilseed milling").
// statedata["Utah"].subtotal3s["311"] is the totals of the codes that start with "311" (eg, 3111 + 3113 + 3114). NOTE: this may not sum to id3s["311"] due to the collection methods
// NOTE: any of these may be undefined, so use || when accessing. eg: console.log(statedata["Utah"].subtotal3s["311"].prod_ann_w || 0);
var statedata = [];

// this should be a separate file
var codelabels = new Object;
codelabels["31"] = "Agriculture manufacture";
codelabels["32"] = "Nonmetals manufacture";
codelabels["33"] = "Metals manufacture";
codelabels["311"] = "Food manufacturing";
codelabels["3111"] = "Animal food manufacturing";
codelabels["3112"] = "Grain and oilseed milling";
codelabels["3113"] = "Sugar and confectionery product manufacturing";
codelabels["3114"] = "Fruit and vegetable preserving and specialty food manufacturing";
codelabels["3115"] = "Dairy product manufacturing";
codelabels["3116"] = "Animal slaughtering and processing";
codelabels["3117"] = "Seafood product preparation and packaging";
codelabels["3118"] = "Bakeries and tortilla manufacturing";
codelabels["3119"] = "Other food manufacturing";
codelabels["312"] = "Beverage and tobacco product manufacturing";
codelabels["3121"] = "Beverage manufacturing";
codelabels["3122"] = "Tobacco manufacturing";
codelabels["313"] = "Textile mills";
codelabels["3131"] = "Fiber, yarn, and thread mills";
codelabels["3132"] = "Fabric mills";
codelabels["3133"] = "Textile and fabric finishing and fabric coating mills";
codelabels["314"] = "Textile product mills";
codelabels["3141"] = "Textile furnishings mills";
codelabels["3149"] = "Other textile product mills";
codelabels["315"] = "Apparel manufacturing";
codelabels["3151"] = "Apparel knitting mills";
codelabels["3152"] = "Cut and sew apparel manufacturing";
codelabels["3159"] = "Apparel accessories and other apparel manufacturing";
codelabels["316"] = "Leather and allied product manufacturing";
codelabels["3161"] = "Leather and hide tanning and finishing";
codelabels["3162"] = "Footwear manufacturing";
codelabels["3169"] = "Other leather and allied product manufacturing";
codelabels["321"] = "Wood product manufacturing";
codelabels["3211"] = "Sawmills and wood preservation";
codelabels["3212"] = "Veneer, plywood, and engineered wood product manufacturing";
codelabels["3219"] = "Other wood product manufacturing";
codelabels["322"] = "Paper manufacturing";
codelabels["3221"] = "Pulp, paper, and paperboard mills";
codelabels["3222"] = "Converted paper product manufacturing";
codelabels["323"] = "Printing and related support activities";
codelabels["3231"] = "Printing and related support activities";
codelabels["324"] = "Petroleum and coal products manufacturing";
codelabels["3241"] = "Petroleum and coal products manufacturing";
codelabels["325"] = "Chemical manufacturing";
codelabels["3251"] = "Basic chemical manufacturing";
codelabels["3252"] = "Resin, synthetic rubber, and artificial synthetic fibers and filaments manufacturing";
codelabels["3253"] = "Pesticide, fertilizer, and other agricultural chemical manufacturing";
codelabels["3254"] = "Pharmaceutical and medicine manufacturing";
codelabels["3255"] = "Paint, coating, and adhesive manufacturing";
codelabels["3256"] = "Soap, cleaning compound, and toilet preparation manufacturing";
codelabels["3259"] = "Other chemical product and preparation manufacturing";
codelabels["326"] = "Plastics and rubber products manufacturing";
codelabels["3261"] = "Plastics product manufacturing";
codelabels["3262"] = "Rubber product manufacturing";
codelabels["327"] = "Nonmetallic mineral product manufacturing";
codelabels["3271"] = "Clay product and refractory manufacturing";
codelabels["3272"] = "Glass and glass product manufacturing";
codelabels["3273"] = "Cement and concrete product manufacturing";
codelabels["3274"] = "Lime and gypsum product manufacturing";
codelabels["3279"] = "Other nonmetallic mineral product manufacturing";
codelabels["331"] = "Primary metal manufacturing";
codelabels["3311"] = "Iron and steel mills and ferroalloy manufacturing";
codelabels["3312"] = "Steel product manufacturing from purchased steel";
codelabels["3313"] = "Alumina and aluminum production and processing";
codelabels["3314"] = "Nonferrous metal (except aluminum) production and processing";
codelabels["3315"] = "Foundries";
codelabels["332"] = "Fabricated metal product manufacturing";
codelabels["3321"] = "Forging and stamping";
codelabels["3322"] = "Cutlery and handtool manufacturing";
codelabels["3323"] = "Architectural and structural metals manufacturing";
codelabels["3324"] = "Boiler, tank, and shipping container manufacturing";
codelabels["3325"] = "Hardware manufacturing";
codelabels["3326"] = "Spring and wire product manufacturing";
codelabels["3327"] = "Machine shops; turned product; and screw, nut, and bolt manufacturing";
codelabels["3328"] = "Coating, engraving, heat treating, and allied activities";
codelabels["3329"] = "Other fabricated metal product manufacturing";
codelabels["333"] = "Machinery manufacturing";
codelabels["3331"] = "Agriculture, construction, and mining machinery manufacturing";
codelabels["3332"] = "Industrial machinery manufacturing";
codelabels["3333"] = "Commercial and service industry machinery manufacturing";
codelabels["3334"] = "Ventilation, heating, air-conditioning, and commercial refrigeration equipment manufacturing";
codelabels["3335"] = "Metalworking machinery manufacturing";
codelabels["3336"] = "Engine, turbine, and power transmission equipment manufacturing";
codelabels["3339"] = "Other general purpose machinery manufacturing";
codelabels["334"] = "Computer and electronic product manufacturing";
codelabels["3341"] = "Computer and peripheral equipment manufacturing";
codelabels["3342"] = "Communications equipment manufacturing";
codelabels["3343"] = "Audio and video equipment manufacturing";
codelabels["3344"] = "Semiconductor and other electronic component manufacturing";
codelabels["3345"] = "Navigational, measuring, electromedical, and control instruments manufacturing";
codelabels["3346"] = "Manufacturing and reproducing magnetic and optical media";
codelabels["335"] = "Electrical equipment, appliance, and component manufacturing";
codelabels["3351"] = "Electric lighting equipment manufacturing";
codelabels["3352"] = "Household appliance manufacturing";
codelabels["3353"] = "Electrical equipment manufacturing";
codelabels["3359"] = "Other electrical equipment and component manufacturing";
codelabels["336"] = "Transportation equipment manufacturing";
codelabels["3361"] = "Motor vehicle manufacturing";
codelabels["3362"] = "Motor vehicle body and trailer manufacturing";
codelabels["3363"] = "Motor vehicle parts manufacturing";
codelabels["3364"] = "Aerospace product and parts manufacturing";
codelabels["3365"] = "Railroad rolling stock manufacturing";
codelabels["3366"] = "Ship and boat building";
codelabels["3369"] = "Other transportation equipment manufacturing";
codelabels["337"] = "Furniture and related product manufacturing";
codelabels["3371"] = "Household and institutional furniture and kitchen cabinet manufacturing";
codelabels["3372"] = "Office furniture (including fixtures) manufacturing";
codelabels["3379"] = "Other furniture related product manufacturing";
codelabels["339"] = "Miscellaneous manufacturing";
codelabels["3391"] = "Medical equipment and supplies manufacturing";
codelabels["3399"] = "Other miscellaneous manufacturing";
codelabels["0"] = "Unaccounted";

// keep small differences out of "Unaccounted" value
function subdatamin(a, b) {
    var d;
    if ((d = a - b) > 4)
        return d;
    return 0;
}

// subtract custom data objects
function subdataobject(start, diff) {

    if ((typeof diff) == "undefined") {
        return {sector:"Unaccounted", code:0, emp:start.emp, ann_pay:start.ann_pay, prod_avg:start.prod_avg,
            prod_ann_h:start.prod_ann_h, prod_ann_w:start.prod_ann_w, mat_cost:start.mat_cost,
            ship_val:start.ship_val, val_added:start.val_added, total_exp:start.total_exp};
    }

    return {sector:"Unaccounted", code:0, emp:subdatamin(start.emp, diff.emp), ann_pay:subdatamin(start.ann_pay, diff.ann_pay), prod_avg:subdatamin(start.prod_avg, diff.prod_avg),
        prod_ann_h:subdatamin(start.prod_ann_h, diff.prod_ann_h), prod_ann_w:subdatamin(start.prod_ann_w, diff.prod_ann_w), mat_cost:subdatamin(start.mat_cost, diff.mat_cost),
        ship_val:subdatamin(start.ship_val, diff.ship_val), val_added:subdatamin(start.val_added, diff.val_added), total_exp:subdatamin(start.total_exp, diff.total_exp)};

}

// add custom data objects. Note: use "undefined" for arg "add" to make a deep copy
function adddataobject(start, add) {

    if ((typeof add) == "undefined") {
        return {sector:start.sector, code:start.code, emp:start.emp, ann_pay:start.ann_pay, prod_avg:start.prod_avg,
            prod_ann_h:start.prod_ann_h, prod_ann_w:start.prod_ann_w, mat_cost:start.mat_cost,
            ship_val:start.ship_val, val_added:start.val_added, total_exp:start.total_exp};
    }

    return {sector:codelabels[start.code], code:start.code, emp:start.emp + add.emp, ann_pay:start.ann_pay + add.ann_pay, prod_avg:start.prod_avg + add.prod_avg,
        prod_ann_h:start.prod_ann_h + add.prod_ann_h, prod_ann_w:start.prod_ann_w + add.prod_ann_w, mat_cost:start.mat_cost + add.mat_cost,
        ship_val:start.ship_val + add.ship_val, val_added:start.val_added + add.val_added, total_exp:start.total_exp + add.total_exp};

}

// break down an array of arrays into a sum array
function addarrdataobject(start, add) {
    var i = 0, ret = [];

    for ( ; i < start.length; i++)
    {
        ret[i] = adddataobject(start[i], add[i]);
    }

    return ret;
}

// function to convert multidimensional state data array into a linear array for D3's pie().data() function
// depth: 0 == root of sunburst, 1 === middle level, 2 === outer level
// NOTE: cannot simply return id3s array since it can have thousands of empty values, and we don't want thousands of empty pie slices
function getpiearray(depth) {
    var state, code, rets = [];

    for (state in selectedStates)
    {
        var place = selectedStates[state];
        if (depth === 0)
        {
            for (code in statedata[place].id2s)
            {
                rets[code] = adddataobject(statedata[place].id2s[code], rets[code]); // in case there is already data in rets[code]
            }
        } else if (depth === 1) {
            for (code in statedata[place].id3s)
            {
                rets[code] = adddataobject(statedata[place].id3s[code], rets[code]);
            }
        } else if (depth === 2) {
            for (code in statedata[place].id4s)
            {
                rets[code] = adddataobject(statedata[place].id4s[code], rets[code]);
            }
        }
    }

    var key, ret = [];
    for (key in rets) // assume keys are iterated alphabetically (XXX not always true, depends on browser/version)
    {
        ret.push(rets[key]); // returned array cannot be associative, hence this extra work
    }
    return ret;
}

// helper function: create a new index for a state, if that state wasn't previously added, or add a state's datum
function addtostates(place, id, data) {

    if (place in statedata)
    {
        if (id.length === 3) // eg. "312"
            statedata[place].id3s[id] = data;
        else if (id.length === 4) // eg. "3241"
            statedata[place].id4s[id] = data;
    } else {
        statedata[place] = {id2s:new Array, id3s:new Array, id4s:new Array};
        if (id.length === 3)
            statedata[place].id3s[id] = data;
        else if (id.length === 4)
            statedata[place].id4s[id] = data;
    }

}

// does the object still hold any value to display?
function nonzeroobject(obj) {
    if (obj.emp != 0 || obj.ann_pay != 0 ||  obj.prod_avg != 0 ||
            obj.prod_ann_h != 0 ||  obj.prod_ann_w != 0 ||  obj.mat_cost != 0 ||
            obj.ship_val != 0 ||  obj.val_added != 0 ||  obj.total_exp != 0)
        return true;
    return false;
}

// read the hierarchy data from the csv and make multidimensional object to hold data
d3.csv('csvs/2013_data_id.csv', function(data) {

    data.forEach(function(d, i) {
        if (d.id === "31-33") // ignore totals from csv. generate dynamically for now
            return;
        addtostates(d.place, d.id, {sector:d.sector, code:d.id, emp:parseFloat(d.emp), ann_pay:parseFloat(d.ann_pay),
                prod_avg:parseFloat(d.prod_avg), prod_ann_h:parseFloat(d.prod_ann_h), prod_ann_w:parseFloat(d.prod_ann_w), mat_cost:parseFloat(d.mat_cost),
                ship_val:parseFloat(d.ship_val), val_added:parseFloat(d.val_added), total_exp:parseFloat(d.total_exp)});
    });

    // calculate sum of industry subcodes, in order to detect missing values
    var state, id;
    for (state in statedata) {
        var shortcode, subtotal3s = [];

        // make subtotal array
        for (id in statedata[state].id4s)
        {
            shortcode = id.substr(0, 3); // "3112" adds into subtotal3s["311"]
            if (shortcode in subtotal3s)
                subtotal3s[shortcode] = adddataobject(subtotal3s[shortcode], statedata[state].id4s[id]);
            else
                subtotal3s[shortcode] = adddataobject(statedata[state].id4s[id], undefined); // actually makes a deep copy
        }

        for (id in statedata[state].id3s)
        {
            // subtotals done, so compare to the file's values and store them to be displayed
            // no four-digit code ends with zero (in csv), so use a "zero code" to hold the unaccounted values
            var obj = subdataobject(statedata[state].id3s[id], subtotal3s[id]);
            if (nonzeroobject(obj))
                statedata[state].id4s[id + "0"] = obj;

            // make the sunburst's root-level subtotal, now that the middle-level has been summed
            shortcode = id.substr(0, 2); // "311" will convert to id2s["31"]
            if (shortcode in statedata[state].id2s)
                statedata[state].id2s[shortcode] = adddataobject(statedata[state].id2s[shortcode], statedata[state].id3s[id]);
            else
                statedata[state].id2s[shortcode] = adddataobject(statedata[state].id3s[id], undefined);

            statedata[state].id2s[shortcode].code = shortcode;
            statedata[state].id2s[shortcode].sector = codelabels[shortcode];
        }
    }

    // there are many 'missing' data points, eg "3141" exists but no "314" data point
    var toadd = []; // toadd will hold values for each state
    for (state in statedata) {
        for (id in statedata[state].id4s)
        {
            shortcode = id.substr(0, 3);
            if (!(shortcode in statedata[state].id3s)) // is there a corresponding id3 for each id4?
            {
                if (state in toadd)
                {
                    toadd[state].id3s[shortcode] = adddataobject(statedata[state].id4s[id], toadd[state].id3s[shortcode]); // sum values into an id3 code
                } else {
                    toadd[state] = {id3s:new Array};
                    toadd[state].id3s[shortcode] = adddataobject(statedata[state].id4s[id], undefined); // make a deep copy
                }
            }
        }
    }

    // toadd now has the summed, missing values needed to be put into main array
    for (state in toadd)
    {
        for (id in toadd[state].id3s)
        {
            // Problem: New Mexico did not have any 32XX data, except for 3273, so check for existing id2 code!
            shortcode = id.substr(0,2);
            if (shortcode in statedata[state].id2s)
                statedata[state].id2s[shortcode] = adddataobject(statedata[state].id2s[shortcode], toadd[state].id3s[id]);
            else
                statedata[state].id2s[shortcode] = adddataobject(toadd[state].id3s[id], undefined); // make a deep copy

            statedata[state].id3s[id] = toadd[state].id3s[id];
            statedata[state].id3s[id].sector = codelabels[id];
            statedata[state].id3s[id].code = id;

            statedata[state].id2s[shortcode].sector = codelabels[shortcode];
            statedata[state].id2s[shortcode].code = shortcode;
        }
    }

    UpdateSunburst();
});



// --- --- --- End parse file into heirarchy --- --- ---


// detailed below
var temparray, temparray2, temparray3;

// update sunburst when something happens
function UpdateSunburst() {

    arcgroup.selectAll('path').remove();
    sunburstlabel2.text("");
    if (selectedStates.length < 1)
    {
        sunburstlabel1.text('[Please select a state]');
        return;
    }
    else
    {
        sunburstlabel1.text("");
    }

    // hack: temparray so that these functions can access original data points when called
    temparray = getpiearray(0);
    arcgroup.selectAll('path.innerpie').data(pie(temparray))
                .enter().append('path').attr('class', 'innerpie')
                .attr('d', innerarc)
                .style('fill', function(d, i) {return arccolors(temparray[i].code);}) // hack
                .style('opacity', .5)
                .style('stroke', '#202020')
                .on('mouseover', function(d, i) {
                    d3.select(this).style('opacity', 1);
                    sunburstlabel1.text(temparray[i].code + ":" + temparray[i].sector); // hack
                    sunburstlabel2.text(sunburstdatalabelprefix + d.value.toLocaleString() + sunburstdatalabelsuffix); // add punctuation or "thousands"
                })
                .on('mouseout', function(d, i) {
                    d3.select(this).style('opacity', .5);
                    sunburstlabel1.text("");
                    sunburstlabel2.text("");
                })
                .each(function(d, i){
                    d3.select(this)
                        .append('title').attr('class', 'tooltip' + temparray[i].code) // hack
                        .text(temparray[i].code + ":" + temparray[i].sector);
                });

    temparray2 = getpiearray(1);
    arcgroup.selectAll('path.middlepie').data(pie(temparray2))
                .enter().append('path').attr('class', 'middlepie')
                .attr('d', middlearc)
                .style('fill', function(d, i) {return arccolors(temparray2[i].code);})
                .style('opacity', .5)
                .style('stroke', '#202020')
                .on('mouseover', function(d, i) {
                    d3.select(this).style('opacity', 1);
                    sunburstlabel1.text(temparray2[i].code + ":" + temparray2[i].sector);
                    sunburstlabel2.text(sunburstdatalabelprefix + d.value.toLocaleString() + sunburstdatalabelsuffix);
                })
                .on('mouseout', function(d) {
                    d3.select(this).style('opacity', .5);
                    sunburstlabel1.text("");
                    sunburstlabel2.text("");
                })
                .each(function(d, i){
                    d3.select(this)
                        .append('title').attr('class', 'tooltip' + temparray2[i].code)
                        .text(temparray2[i].code + ":" + temparray2[i].sector);
                });

    temparray3 = getpiearray(2);
    arcgroup.selectAll('path.outerpie').data(pie(temparray3))
                .enter().append('path').attr('class', 'outerpie')
                .attr('d', outerarc)
                .style('opacity', .5)
                .style('stroke', '#202020')
                .on('mouseover', function(d, i) {
                    d3.select(this).style('opacity', 1);
                    sunburstlabel1.text(temparray3[i].code + ":" + temparray3[i].sector);
                    sunburstlabel2.text(sunburstdatalabelprefix + d.value.toLocaleString() + sunburstdatalabelsuffix);
                })
                .on('mouseout', function(d, i) {
                    d3.select(this).style('opacity', .5);
                    sunburstlabel1.text("");
                    sunburstlabel2.text("");
                })
                .each(function(d, i){
                    var self = d3.select(this);
                    var code = temparray3[i].code;
                    self.append('title').text(code + ":" + temparray3[i].sector); // tooltip
                    if (code > 0) // don't show unaccounted blocks
                        self.attr('class', 'outerpie').style('fill', function(d, i) {return arccolors(code);});
                    else {
                        if (hidemissing)
                            self.attr('display', 'none');
                        else
                            self.style('fill', '#FFFFFF');
                    }
                });
}
