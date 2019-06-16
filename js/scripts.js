/* Scripts.js - Nick Winans
** Version 2.0
** Contains all the scripts to retrieve relevent Bitcoin Mining Data
*/

//global variables
var calls = 0;
var time = 30;
const electricityPrice = 0.11;

//holds any relevant nicehash, coinbase and price information, updates all on screen tickers with every related update
var data = {
    cb: 0.0,
    nh: 0.0,
    usd: 0.0,
    btc: 0.0,
    nhp: 0.0,
    nhap: 0.0,
    nhadp: 0.0,
    set coinbase(newval) {
        this.cb = newval;
        window.localStorage.coinbase = newval;
        if (document.getElementById("coinbasebalancebtc")){
            document.getElementById("coinbasebalancebtc").innerHTML = (Math.round(newval*100000000)/100000000) +  " &#579";
            document.getElementById("coinbasebalanceusd").innerHTML = "$" + (Math.round(this.usd * newval*100)/100);
        }
        if (typeof this.nh == undefined) this.btc = newval;
        else this.bitcoin = newval + this.nh;
        if (document.getElementById("paybackprogress")){
            createProgressBars();
        }
    },
    set nicehash(newval) {
        this.nh = newval;
        window.localStorage.nicehash = newval;
        if (document.getElementById("nicehashearningsbtc")){
            document.getElementById("nicehashearningsbtc").innerHTML = (Math.round(newval*100000000)/100000000) + " &#579";
            document.getElementById("nicehashearningsusd").innerHTML = "$" + (Math.round(this.usd * newval*100)/100);
        }
        if(typeof this.cb === undefined) this.btc = newval;
        else this.bitcoin = newval + this.cb;
        if (document.getElementById("paybackprogress")){
            createProgressBars();
        }
        if (document.getElementById("projpay")) {
            getProjectedPayout();
        }
    },
    /**
     * @param {number} newval nicehash profitibily value
     */
    set nicehashprofitablity(newval) {
        this.nhp = newval;
        if (document.getElementById("nicehashdailybtcprofit")){
            document.getElementById("nicehashdailybtcprofit").innerHTML = (Math.round(newval*100000000)/100000000) + " &#579";
            document.getElementById("nicehashdailyusdprofit").innerHTML = "$" + (Math.round(this.usd * newval*100)/100);
        }
        
    },
    /**
     * @param {number} newval nicehash adjusted profitibily value
     */
    set nicehashadjustedprofitibility(newval) {
        this.nhap = newval;
        if (document.getElementById("nicehashdailyaveragebtcprofit")) {
            document.getElementById("nicehashdailyaveragebtcprofit").innerHTML = (Math.round(newval*100000000)/100000000) + " &#579";
            document.getElementById("nicehashdailyaverageusdprofit").innerHTML = "$" + (Math.round(this.usd * newval*100)/100);
        }
        if (document.getElementById("nicehashdailyadjustedbtcprofit")) {
            document.getElementById("nicehashdailyadjustedbtcprofit").innerHTML = (Math.round((newval * this.usd - this.nhadp)/this.usd*100000000)/100000000) + " &#579";
        }
        if (document.getElementById("nicehashdailyadjustedusdprofit")) {
            document.getElementById("nicehashdailyadjustedusdprofit").innerHTML = "$" + (Math.round((newval * this.usd - this.nhadp)*100)/100);
        }
        if (document.getElementById("projpay")) {
            getProjectedPayout();
        }
    },
    set bitcoin(newval) {
        this.btc = newval;
        window.localStorage.totalbitcoin = newval;
        if (document.getElementById("totalbtc")){
            document.getElementById("totalbtc").innerHTML = (Math.round(newval*100000000)/100000000) + " &#579";
            document.getElementById("totalusd").innerHTML = "$" + (Math.round(newval * this.usd * 100)/100);
        }
        if (document.getElementById("earned")) {
            document.getElementById("earned").innerHTML = "$" + (Math.round(this.usd * newval*100)/100);
            var perc = 100-Math.round(((this.usd * newval)/(parseFloat(document.getElementById("spent").innerHTML.substring("1"))))*100);
            document.getElementById("left").innerHTML = "$" + (Math.round((parseFloat(document.getElementById("spent").innerHTML.substring("1")) - (this.usd * newval))*100)/100) + " (" + perc + "%)";
        }
    },
    set usdvalue(newval) {
        this.usd = newval;
        window.localStorage.btcusd = newval;
        window.localStorage.btcval = newval * this.btc;
        if (document.getElementById("btcprice")){
            document.getElementById("btcprice").innerHTML = "$" + newval;
        }
        if (document.getElementById("coinbasebalanceusd")){
            document.getElementById("coinbasebalanceusd").innerHTML = "$" + (Math.round(this.cb * newval*100)/100);
        }
        if (document.getElementById("nicehashearningsusd")){
            document.getElementById("nicehashearningsusd").innerHTML = "$" + (Math.round(this.nh * newval * 100)/100);
        }
        if (document.getElementById("totalusd")){
            document.getElementById("totalusd").innerHTML = "$" + (Math.round(this.btc * newval*100)/100);
        }
        if (document.getElementById("nicehashdailyusdprofit")){
            document.getElementById("nicehashdailyusdprofit").innerHTML = "$" + (Math.round(newval * this.nhp * 100)/100);
        }
        if (document.getElementById("nicehashdailyaverageusdprofit")) {
            document.getElementById("nicehashdailyaverageusdprofit").innerHTML = "$" + (Math.round(this.nhap * newval*100)/100);
        }
        if (document.getElementById("nicehashdailyadjustedusdprofit")) {
            document.getElementById("nicehashdailyadjustedusdprofit").innerHTML = "$" + (Math.round((this.nhap * newval - this.nhadp)*100)/100);
        }
        if (document.getElementById("paybackprogress")){
            createProgressBars();
        }
        if (document.getElementById("earned")) {
            document.getElementById("earned").innerHTML = "$" + (Math.round(this.btc * newval*100)/100);
            var perc = 100-Math.round(((this.btc * newval)/(parseFloat(document.getElementById("spent").innerHTML.substring("1"))))*100);
            document.getElementById("left").innerHTML = "$" + (Math.round((parseFloat(document.getElementById("spent").innerHTML.substring("1")) - (this.btc * newval))*100)/100)  + "(" + perc + "%)";;
        }
    },
    set electricity(newval) {
        this.nhadp = ((newval/1000 * 24 * electricityPrice));
        if (document.getElementById("nicehashdailyadjustedbtcprofit")) {
            document.getElementById("nicehashdailyadjustedbtcprofit").innerHTML = (Math.round((this.nhap * this.usd - this.nhadp)/this.usd*100000000)/100000000) + " &#579";
        }
        if (document.getElementById("nicehashdailyadjustedusdprofit")) {
            document.getElementById("nicehashdailyadjustedusdprofit").innerHTML = "$" + (Math.round((this.nhap * this.usd - this.nhadp)*100)/100);
        }
        if (document.getElementById("gpuelectricity")) document.getElementById("gpuelectricity").innerHTML = newval + "W"
    }
};

/* 
** Main functions, gets called often, specially by dashboard, 
*/
function refreshData() {
    //delete cached data
    if (document.location.pathname == "/btc/") {
        getBitcoinPrice();
        getNicehashBasic();
        getNicehashWorkers();
        getNicehashAverageEarnings();
        createProfibilityChart();
        getCoinbaseSavings();
    } else if (document.location.pathname == "/btc/coinbase/") {
        getBitcoinPrice();
        getCoinbaseSavings();
        getCoinbaseTransactions();
    } else if (document.location.pathname == "/btc/nicehash/") {
        getBitcoinPrice();
        getNicehashBasic();
        getNicehashWorkers();
        getNicehashAverageEarnings();
        createBalanceChart();
        createCoinDistributionChart();
        createProfibilityChart();
        getGPUData();
    } else if (document.location.pathname == "/btc/components/") {
        getBitcoinPrice();
        getNicehashBasic();
        getCoinbaseSavings();
        loadGear();
        createProgressBars();
    }
    time = 30;
}
function refreshGPUData() {
    if (document.location.pathname == "/btc/rigstats/") {
        getFullGPUData();
        getGPUSummary();
        time = 10;
    }
    getGPUData();
}
function updateTimer() {
    if (document.getElementById("ttr").innerHTML.length !== 1) document.getElementById("ttr").innerHTML = time + "s";
    time--;
}
document.onclick = function(event) {
    var element = document.getElementsByClassName("side-nav-btn")[0];
    if (!event.target.closest("#side-nav-container")){
        if (getComputedStyle(element, null).display != "none" && document.getElementById("side-nav-container").offsetLeft != -250) {
            closeNav();
        }
    }
}
function openNav() {
    document.getElementsByClassName("side-nav")[0].style.left = "0px";
}
function closeNav() {
    document.getElementsByClassName("side-nav")[0].style.left = "-250px";
}


/* 
** Nicehash Functions
*/
function getNicehashBasic() {
    if (self.fetch) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider.ex&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var bal = 0.0;
            var profit = 0.0;
            for (var i = 0; i < json.result.current.length; i++) {
                bal += parseFloat(json.result.current[i].data[1]);
                if (json.result.current[i].data[0].a) {
                    profit += (parseFloat(json.result.current[i].data[0].a) * parseFloat(json.result.current[i].profitability));
                }
            }
            data.nicehashprofitablity = profit;
            data.nicehash = bal;
        });
    }
}
function getNicehashWorkers() {
    if (self.fetch && document.getElementById("nicehashstatstable")) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider.workers&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var workers = json.result.workers;
            var i = 0;

            var myTable = document.getElementById("nicehashstatstable");
            var rowCount = myTable.rows.length; 
            while(--rowCount) myTable.deleteRow(rowCount);

            workers.forEach(function(worker) {
                //create or retrieve the row that holds the entries
                var tr = document.getElementById(worker[0] + i);
                var add = (tr == null);
                if (add) {
                    tr = document.createElement("tr");
                    tr.className = "striped";
                    tr.id=worker[0] + i;
                    //name
                    var workername = document.createElement("td");
                    workername.className = "center";
                    workername.innerHTML = worker[0];
                    workername.id=worker[0] + i +"0";
                    //algorithm
                    var algorithm = document.createElement("td");
                    algorithm.className = "center";
                    algorithm.innerHTML = algoCodeToString(worker[6]);
                    algorithm.id=worker[0] + i+"1";
                    //speed
                    var speed = document.createElement("td");
                    speed.className = "center";
                    var s = worker[1].a;
                    s += algoCodeUnits(worker[6]);
                    speed.innerHTML = s;
                    speed.id=worker[0] + i+"2";
                    //time connected
                    var timeconnected = document.createElement("td");
                    timeconnected.className = "center";
                    timeconnected.innerHTML = worker[2] + " mins";
                    timeconnected.id=worker[0] + i+"3";

                    tr.appendChild(workername);
                    tr.appendChild(algorithm);
                    tr.appendChild(speed);
                    tr.appendChild(timeconnected);

                    document.getElementById("nicehashstatstable").appendChild(tr);
                } 
                i++;
            });
            i=0;
        });
    }
}
function getNicehashAverageEarnings() {
    if (self.fetch) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider.ex&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
        //fetch('sample-nicehash.json', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var total = 0.0;
            var ma30length = 36; //3 hours, samples every 5 min
            for (var j = 0; j < json.result.past.length; j++) {
                var profit = parseFloat(json.result.current[j].profitability)
                for (var i = json.result.past[j].data.length - ma30length; i < json.result.past[j].data.length; i++) {
                    var d = json.result.past[j].data[i];
                    if (Object.keys(d[1]).length != 0) {
                        total += parseInt(d[1].a) * profit;
                    }                
                }
            }
            total /= ma30length;
            data.nicehashadjustedprofitibility = total;
        });
    }
}
function getProjectedPayout() {
    var left = .001 - data.nh;
    var rate = data.nhap;
    if (left === 0 || rate === 0) return;
    var now = new Date();
    var nn = new Date();
    var days = 1;
    nn.setDate(now.getDate() + days);
    nn.setHours(5, 30, 0, 0);
    var distance = nn - now;
    var ttn = distance / (1000 * 60 * 60 * 24);
    while (left - rate*ttn > 0) {
        days++;
        nn.setDate(now.getDate() + days);
        distance = nn - now;
        ttn = distance / (1000 * 60 * 60 * 24);
    }

    if(document.getElementById("projpay")) document.getElementById("projpay").innerHTML = monthNames[nn.getMonth()] + " " + nn.getDate();
    if(document.getElementById("projpayamt")) document.getElementById("projpayamt").innerHTML = Math.round((data.nh + (rate*ttn)) * 1e8)/1e8;
}


/*
** Coinbase Functions
*/
function getBitcoinPrice() {
    if (self.fetch) {
        fetch('https://api.pro.coinbase.com/products/BTC-USD/ticker', {
            method: 'GET'
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            data.usdvalue = json.bid;
        });
    }
}
function getCoinbaseSavings() {
    if (self.fetch) {
        var timestamp = Date.now() / 1000 | 0;
        var shaObj = new jsSHA(timestamp.toString()+"GET/v2/accounts/f3580f06-fd63-51c8-b5a6-18fb41c6d42f", "TEXT");
        var hmac = shaObj.getHMAC("k44A4RicDNpDxNtpYPrHrha6QOIz9Qub", "TEXT", "SHA-256", "HEX");
        fetch('https://api.coinbase.com/v2/accounts/f3580f06-fd63-51c8-b5a6-18fb41c6d42f', {
            method: 'GET',
            headers: {
                "CB-ACCESS-TIMESTAMP" : timestamp.toString(),
                "CB-ACCESS-KEY": "eXLDdULdI6SWbIfb",
                "CB-ACCESS-SIGN": hmac
            }
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            data.coinbase = parseFloat(json.data.balance.amount);
        });
    }
}
function getCoinbaseTransactions() {
    var timestamp2 = Date.now() / 1000 | 0;
    var shaObj2 = new jsSHA(timestamp2.toString()+"GET/v2/accounts/f3580f06-fd63-51c8-b5a6-18fb41c6d42f/transactions", "TEXT");
    var hmac2 = shaObj2.getHMAC("k44A4RicDNpDxNtpYPrHrha6QOIz9Qub", "TEXT", "SHA-256", "HEX");
    fetch ('https://api.coinbase.com/v2/accounts/f3580f06-fd63-51c8-b5a6-18fb41c6d42f/transactions', {
        method: 'GET',
        headers: {
            "CB-ACCESS-TIMESTAMP" : timestamp2.toString(),
            "CB-ACCESS-KEY": "eXLDdULdI6SWbIfb",
            "CB-ACCESS-SIGN": hmac2
        }
    }).then(function(response) {
        return response.json();
    }).then(function(json) {
        var table = document.getElementById("transactionstable");
        for (var i = 0; i < json.data.length; i++) {
            tr = document.createElement("tr");
            tr.className="striped";
            
            var type = document.createElement("td");
            type.className = "center";
            type.innerHTML = json.data[i].type.substring(0,1).toUpperCase() + json.data[i].type.slice(1);

            var btc = document.createElement("td");
            btc.className = "center";
            btc.innerHTML = json.data[i].amount.amount + " &#579";

            var usd = document.createElement("td");
            usd.className = "center";
            usd.innerHTML = "$" + json.data[i].native_amount.amount;

            var date = document.createElement("td");
            date.className = "center";
            var datedate = new Date(json.data[i].created_at);
            date.innerHTML = monthNames[datedate.getMonth()] + " " + datedate.getDate() + " " + datedate.getFullYear();

            tr.appendChild(type);
            tr.appendChild(btc);
            tr.appendChild(usd);
            tr.appendChild(date);

            table.appendChild(tr);
        }
    });
}


/*
** GPU Functions
*/
function getGPUData() {
    if (self.fetch) {
        fetch('/btc/payload.json', {
            method: 'GET',
            cache: 'no-store'
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var table = document.getElementById("cardinfotable");

            var electricityUsage = 0.0;

            if (table) {
                var rowCount = table.rows.length;
                while (--rowCount) table.deleteRow(rowCount);
            }

            Object.keys(json).filter(function(object, i){
                return !(json[i]["name"] === null);
            }).sort(function(object, object2) {
                return simpleCompare(parseInt(json[object]["name"].substring(12,17)), parseInt(json[object2]["name"].substring(12,17)));
            }).map(function(i) {
                if (table) {
                    var tr = document.createElement("tr");
                    tr.className = "striped";

                    var gpuname = document.createElement("td");
                    gpuname.className = "center";
                    gpuname.id = "gpu" + i;
                    gpuname.innerHTML = json[i]["name"];

                    var temp = document.createElement("td");
                    temp.className = "center";
                    temp.id = "gpu" + i + "0";
                    temp.innerHTML = json[i]["temperature_gpu"] + "&degC";

                    var fan = document.createElement("td");
                    fan.className = "center";
                    fan.id = "gpu" + i + "1";
                    fan.innerHTML = nvsmiFix(json[i]["fan_speed"]);

                    var ugpu = document.createElement("td");
                    ugpu.className = "center";
                    ugpu.id = "gpu" + i + "2";
                    ugpu.innerHTML = nvsmiFix(json[i]["utilization_gpu"]);

                    var umem = document.createElement("td");
                    umem.className = "center";
                    umem.id = "gpu" + i + "3";
                    umem.innerHTML = json[i]["utilization_memory"];
                }

                var pu = json[i]["power_draw"];
                electricityUsage += parseFloat(pu.substring(0, pu.length - 2));

                if (table) {
                    tr.appendChild(gpuname);
                    tr.appendChild(temp);
                    tr.appendChild(fan);
                    tr.appendChild(ugpu);
                    //tr.appendChild(umem);
                    table.appendChild(tr);
                }
            });
            this.data.electricity = electricityUsage;
        });
    }
}

function getFullGPUData() {
    if (self.fetch) {
        fetch('/btc/payload.json', {
            method: 'GET'
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var contentDiv = document.getElementsByClassName("details")[0];
            contentDiv.innerHTML = "";
            Object.keys(json).filter(function(object){
                return !(json[object]["name"] === null)
            }).sort(function(object, object2) {
                return simpleCompare(parseInt(json[object]["name"].substring(12,17)), parseInt(json[object2]["name"].substring(12,17)));
            }).map(function(i) {
                //for every outside key
                var temp = json[i];

                var card = document.createElement("div");
                card.className="card";

                var container = document.createElement("div");
                container.className="container";

                var header = document.createElement("h3");
                header.innerHTML = json[i]["name"];

                var table = document.createElement("table");

                Object.keys(temp).sort(function(a, b) {
                    return sortFunction(a).localeCompare(sortFunction(b));
                }).map(function(key, i) {
                    if (key != "temperature_memory") {
                        var tr = document.createElement("tr");
                        tr.className = "center";

                        var th = document.createElement("th");
                        th.className = "title center centernopad";
                        th.innerHTML = nvsmiDecoder(key);

                        var td = document.createElement("td");
                        td.className = "center centernopad";
                        td.innerHTML = nvsmiFix(temp[key]);

                        tr.appendChild(th);
                        tr.appendChild(td);

                        table.appendChild(tr);
                    }
                });
                container.appendChild(header);
                container.appendChild(table);
                card.appendChild(container);
                contentDiv.appendChild(card);
            });
        });
    }
}
function getGPUSummary() {
    if (self.fetch) {
        fetch('/btc/payload.json', {
            method: 'GET'
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var table = document.getElementById("detailsTable");
            var electricity = 0.0;
            var driver = 0.0;
            var minTemp = 100.0;
            var maxTemp = 0.0;

            Object.keys(json).filter(function(object, i){
                if (json[i]["name"] === null) return false;
                return true;
            }).map(function(objectKey, i) {
                electricity += parseFloat(json[i]["power_draw"].substring(0, json[i]["power_draw"].length - 2));
                minTemp = Math.min(minTemp, json[i]["temperature_gpu"]);
                maxTemp = Math.max(maxTemp, json[i]["temperature_gpu"]);
                driver = json[i]["driver"];
            });
            document.getElementById("gpucount").innerHTML = json.length;
            document.getElementById("elecusage").innerHTML = Math.round(electricity * 100) / 100 + " W";
            document.getElementById("temprange").innerHTML = minTemp + "°C - " + maxTemp + "°C"
            document.getElementById("driverversion").innerHTML = driver;
        });
    }
}


/*
** Components Functions
*/
function loadGear() {
    var currentGear = readTextFile("/btc/components/current.dat");
    var curP = document.getElementById("currentgear");

    var cur = currentGear.split(/\r?\n|\r/);
    var curTotal = 0.0;
    cur.forEach(function(gear) {
        var split = gear.split(",");
        var text = "<br>" + split[0] + " ($" + split[1] + ")";
        curTotal += parseFloat(split[1]);
        curP.innerHTML += text;
    });
    document.getElementById("spent").innerHTML = "$" + + Math.round(curTotal*100)/100;

    var futureGear = readTextFile("/btc/components/future.dat");
    var futP = document.getElementById("futuregear");

    var fut = futureGear.split(/\r?\n|\r/);
    fut.forEach(function(gear) {
        if (gear == "") {
            futP.innerHTML += "<br>";
        } else {
            var split = gear.split(",");
            var text = split[0] + " ($" + split[1] + ")<br>";
            futP.innerHTML += text;
        }
    });
}
function readTextFile(file){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(!rawFile.readyState === 4)
        {
            if(!(rawFile.status === 200 || rawFile.status == 0))
            {
                throw new Error("Data not downloaded successfully, HTTP status not 200 or 0");
            }
        }
    }
    rawFile.send();
    return rawFile.responseText;
}


/*
** Charting Functions
*/
function createProfibilityChart() {
    if (self.fetch) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider.ex&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
        //fetch('sample-nicehash.json', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var chart = new CanvasJS.Chart("24hrChartContainerProfit", {
                animationEnabled: false,
                theme: "light2",
                data: []
            });
            var total = [];
            var ma30 = [];
            var ma30graph = [];
            var ma30length = 12;
            for (var j = 0; j < json.result.past.length; j++) {
                var series = [];
                for (var i = json.result.past[j].data.length - 288 - ma30length; i < json.result.past[j].data.length; i++) {
                    var data = json.result.past[j].data[i];
                    var profit = parseFloat(json.result.current[j].profitability)
                    if (Object.keys(data[1]).length != 0) {
                        var temp = {x: data[0] * 300000, y: parseFloat(data[1].a) * profit};
                        series.push(temp);
                        if (total.length < 288 + ma30length) {
                            total.push(temp);
                        } else {
                            k = -(json.result.past[j].data.length - 288 - ma30length) + i;
                            total[k] = {x: total[k].x, y: total[k].y + parseFloat(data[1].a) * profit}
                        }
                    } else {
                        var temp = {x: data[0] * 300000, y: 0};
                        series.push(temp);
                        if (total.length < 288 + ma30length) {
                            //first pass through, just add everything
                            total.push(temp);
                        }
                    }                    
                }
            }
            var max = 0.0;
            total.forEach(el => {
                if (ma30.length != ma30length) ma30.unshift(el.y);
                else {
                    ma30.unshift(el.y);
                    ma30.pop();
                    var t = 0.0;
                    ma30.forEach(el => {
                        t += el / ma30length;
                    });
                    if (!isNaN(t)) max = Math.max(max, t);
                    var tt = {x: el.x, y: t};
                    ma30graph.push(tt);
                }
            });
            var ma30data = {
                type: "line",
                name: "1 Hour Moving Average",
                showInLegend: true,
                xValueType: "dateTime",
                dataPoints: ma30graph
            }
            chart.options.data.push(ma30data);
            chart.options.axisY = {
                includeZero: true,
                minimum: 0,
                maximum: max * 1.1,
                title: "BTC/Day"
            };
            chart.render();
        });
    }
}
function createBalanceChart() {
    if (self.fetch) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider.ex&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
        //fetch('sample-nicehash.json', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var chart = new CanvasJS.Chart("24hrChartContainer", {
                animationEnabled: false,
                theme: "light2",
                legend: {
                    horizontalAlign: "right", // left, center ,right 
                    verticalAlign: "center"  // top, center, bottom
                },
                data: []
            });
            var total = [];
            var max = 0.0;
            for (var j = 0; j < json.result.past.length; j++) {
                var series = [];
                for (var i = json.result.past[j].data.length - 288; i < json.result.past[j].data.length; i++) {
                    var data = json.result.past[j].data[i];
                    var temp = {x: data[0] * 300000, y: parseFloat(data[2])};
                    
                    if (total.length < 288) {
                        //first pass through, just add everything
                        total.push(temp);
                    } else {
                        k = -(json.result.past[j].data.length - 288) + i;
                        total[k] = {x: total[k].x, y: total[k].y + parseFloat(data[2])}
                        if (!isNaN(total[k].y)) max = Math.max(max, total[k].y);
                    }
                    series.push(temp);
                }
                var tempData = {
                    type: "line",
                    name: algoCodeToString(parseInt(json.result.past[j].algo)),
                    //color: "rgb(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255))",
                    showInLegend: true,
                    xValueType: "dateTime",
                    dataPoints: series
                }
                chart.options.data.push(tempData);
            }
            var totalData = {
                type: "line",
                name: "Total",
                //color: "rgb(getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255))",
                showInLegend: true,
                xValueType: "dateTime",
                dataPoints: total
            }
            
            chart.options.data.push(totalData);
            chart.options.axisY = {
                includeZero: true,
                minimum: 0,
                maximum: max * 1.1,
                title: "BTC"
            }
            chart.render();
        });
    }
}
function createCoinDistributionChart() {
    if (self.fetch) {
        fetch('https://nickwinans.com/nicehash.php?url=https://api.nicehash.com/api&method=stats.provider&addr=3Mdb6ivHFxJQ9cDHDjRygQVXScbHRoNW2r', {
            method: 'GET'       
        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            var data = [];
            json["result"]["stats"].forEach(function(value) {
                data.push({y: value["balance"], label: algoCodeToString(value["algo"])});
            });
            var chart = new CanvasJS.Chart("coindistribution", {
                theme: "light2",
                animationEnabled: false,
                toolTip: {
                    enabled: false
                },
                data: [{
                    type: "pie",
                    startAngle: 0,
                    yValueFormatString: "##0.00000000\"BTC\"",
                        indexLabel: "{label} {y}",
                        dataPoints: data
                    }]
            });
            chart.render();
        });
    }   
}
function createProgressBars() {
    if (document.location.pathname =="/btc/components/" || (calls===2 || (calls>2  && calls % 2 === 0))) {
    var bar = document.getElementById("paybackprogress");
    var title = document.getElementById("paybacktitle");
    var totalbar = document.getElementById("totalpaybackprogess");
    var totaltitle = document.getElementById("totalpaybacktitle");

    var earnedmoney = 0.0;

    if (document.getElementById("totalusd")){
        earnedmoney = data.btc * data.usd;
    } else {
        earnedmoney = window.localStorage.btcval;
    }
    
    var totalearnedmoney = earnedmoney;

    var currentGear = readTextFile("/btc/components/current.dat").split(/\r?\n|\r/);
    var i = 0;
    var currentitem;

    var totalspent = 0.0;
    while (i < currentGear.length) {
        currentitem = currentGear[i].split(",");
        var currtotal = parseFloat(currentitem[1]);
        if (earnedmoney >= currtotal) earnedmoney -= currtotal;
        else break;
        i++;
    }

    currentGear.forEach(function(item) {
        var currrrentitem = item.split(",");
        totalspent += parseFloat(currrrentitem[1]);
    });

    if (i !== currentGear.length) {
        bar.style.display = "";
        title.style.display = "";
        totalbar.style.display = "";
        totaltitle.style.display = "";

        bar.value = earnedmoney;
        bar.max = currentitem[1];

        title.innerHTML = "Progress towards " + currentitem[0];

        totalbar.value = totalearnedmoney;
        totalbar.max = totalspent;

        if (currentitem[2] != 1) title.innerHTML += " " + currentitem[2];
    } else {
        bar.style.display = "none";
        title.style.display = "none";
    }
}
calls++;
}


/*
** Helper functions (code to string, etc.)
*/
function algoCodeToString(code) {
    switch (code) {
        case 0: return "Scrypt";
        case 1: return "SHA256";
        case 2: return "ScryptNf";
        case 3: return "X11";
        case 4: return "X13";
        case 5: return "Keccak";
        case 6: return "X15";
        case 7: return "Nist5";
        case 8: return "NeoScrypt";
        case 9: return "Lyra2RE";
        case 10: return "WhirlpoolX";
        case 11: return "Qubit";
        case 12: return "Quark";
        case 13: return "Axiom";        
        case 14: return "Lyra2REv2";
        case 15: return "ScryptJaneNf16";
        case 16: return "Blake256r8";
        case 17: return "Blake256r14";
        case 18: return "Blake256r8vn1";
        case 19: return "Hodl";
        case 20: return "Dagger";
        case 21: return "Decred";
        case 22: return "CryptoNight";
        case 23: return "Lbry";
        case 24: return "Equihash";
        case 25: return "Pascal";
        case 26: return "X11Gost";
        case 27: return "Sia";
        case 28: return "Blake2s";
        case 29: return "Skunk";
        case 30: return "CryptoNightV7";
        case 31: return "CryptoNightHeavy";
        case 32: return "Lyra2Z";
        case 33: return "X16R";
        case 34: return "CryptonightV8";
        case 35: return "SHA256AsicBoost";
        case 36: return "Zhash";
        case 37: return "Beam";
        case 38: return "GrinCuckaroo29";
        case 39: return "GrinCuckatoo31";
        case 40: return "Lyra2REv3";
        case 41: return "MTP";
        case 42: return "CryptoNightR";
        case 43: return "CuckooCycle";
        default: return "Error";
    }
}
function algoCodeUnits(code) {
    switch(code) {
        case 24: return " Sols/s";
        case 41: return " GH/s"
        default: return " MH/s";
    }
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function nvsmiDecoder(key) {
    switch(key) {
        case "name": return "Card Name";
        case "driver": return "Driver Version";
        case "temperature_gpu": return "GPU Temperature";
        case "power_draw": return "Current Power Usage";
        case "power_limit": return "Power Limit";
        case "utilization_gpu": return "GPU Utilization";
        case "utilization_memory": return "Memory Utilization";
        case "memory_used": return "Memory Used";
        case "memory_total": return "Total Memory Available";
        case "clock_memory": return "Memory Clock Speed";
        case "clock_gpu": return "GPU Clock Speed";
        case "pstate": return "Power State (pstate)";
        case "temperature_memory": return "Memory Temperature";
        case "fan_speed": return "Fan Speed";
        default: return key;
    }
}
function sortFunction(key) {
    switch(key) {
        case "name": return "a";
        case "driver": return "b";
        case "temperature_gpu": return "c";
        case "power_draw": return "l";
        case "power_limit": return "m";
        case "utilization_gpu": return "e";
        case "utilization_memory": return "f";
        case "memory_used": return "g";
        case "memory_total": return "h";
        case "clock_memory": return "i";
        case "clock_gpu": return "j";
        case "pstate": return "n";
        case "temperature_memory": return "d";
        case "fan_speed": return "k";
        default: return "z";
    }
}
function simpleCompare(s1, s2) { 
    return s1 < s2 ? -1 : s1 > s2 ? 1 : 0;
}
function nvsmiFix(str) {
    if (str.indexOf("%") != -1) str = str.substring(0, str.indexOf(" ")) + str.substring(str.indexOf(" ") + 1);
    if (str.indexOf("MiB") != - 1) str = str.substring(0, str.indexOf("MiB")) + "MB";
    return str;
}
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
];

function refreshmouseover() {
    document.getElementById("ttr").innerHTML = "&#8634";
}
function resetrefresh() {
    document.getElementById("ttr").innerHTML = time + "s";

}