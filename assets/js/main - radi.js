window.onload = function() {

    $.ajax({
        url: "assets/data/menu.json",
        method: "GET",
        data: "json",
        success: function(data) {
            ispisiNav(data);
    
        },
        error: function(xhr, error, status) {
            console.log(xhr);
        }
    });
    responsiveNav();
    drustveneMreze();
    // dohvatiProizvode();

    let location = window.location.pathname;
	
	if(location == '/' || location == '/index.html') {
        // dohvatiProizvode();
        prikaziIndex();
        popuniUtiske();

        let bookTable = document.querySelector("#bookTable");
        bookTable.addEventListener("click", bookirajSto);
	}

	if(location.indexOf('about') != -1) {
        utisci();
        galerija();
    }
    
    if(location.indexOf("menu") != -1) {
        // dohvatiProizvode();
        initPrikaz();
        popuniKategorije();
        popuniCh();

        popuniSort();


        document.querySelector("#searchMeal").addEventListener("blur", pretrazi);

        // $("input[name=sortType]").change(sortirajIzbor);

        $(window).scroll(function() { 
            if ($(window).scrollTop() >= $( 
              '#foodArea').offset().top + $('#foodArea'). 
                outerHeight() - window.innerHeight) {
                debounce(ucitajJos());
            } 
        }); 

        let bookTable = document.querySelector("#bookTable");
        bookTable.addEventListener("click", bookirajSto);
          
    }

    if(location.indexOf('cart') != -1) {
        let proizvodiNarudzbina = proizvodiUStorage();

        if(proizvodiNarudzbina) {
            prikaziNarudzbinu();
        } else {
            prikaziPraznuNarudzbinu();
        }

        $(".contact-form").hide();

        $("#purchase").click(() => {
            if(proizvodiUStorage()) {
                $(".contact-form").fadeIn();
            }
        })

        let dugme = document.querySelector("#btnSubmit");
        dugme.addEventListener("click", proveriOrder);

        $("#removeAll").click(() => {
            this.localStorage.removeItem("proizvodi");
            prikaziPraznuNarudzbinu();
        });

    }

    if(location.indexOf("contact") != -1) {
        let dugme = document.querySelector("#btnSubmit");
        dugme.addEventListener("click", provera);
    }

    var counter = document.querySelector("#counter");
    if(proizvodiUStorage()) {
        counter.innerHTML = proizvodiUStorage().length;
    }
}

var dodatniData = [];
var brojac = 2;

function ucitajJos() {
    // ++brojac;
    let perPage = 6;
    let offset = (brojac - 1) * perPage;

    
    dohvatiSveProizvode((data) => {
        data = filterKat(data);
        data = filtrirajNizKats(data);

        if(data.length > perPage) {
            ++brojac;
            dodatniData = [];
            for(let i = offset; i < offset + perPage; i++) {
                if(dodatniData.length < data.length) {
                    dodatniData.push(data[i]);
                } else {
                    break;
                }
            }
        }
        
    });

    console.log(brojac);

    if(brojac < 8) {
        // prikaziHranu(dodatniData);
        let rez = stampajHranu(dodatniData);
        console.log(dodatniData);
        proizvodi.innerHTML += rez;

        $(".addToCart").click(upisiUStorage);

    }
}

function ispisiNav(data) {
    let navbar = $("#navbar");
    let lista = '';

    for(let i = 0; i < data.length; i++) {
        lista += `<li>
            <a href="${data[i].putanja}">${data[i].naziv}</a>
        </li>`;
    }

    
    $(lista).insertBefore("#cartLink");
}

function responsiveNav() {
    $('.custom-navbar').on('click', function(){
        $('#navbar').slideToggle("slow");
    });
}

function drustveneMreze() {
    let xhr = kreirajXhrObj();

    xhr.open("GET", "assets/data/socialNetworks.json", true);
    xhr.send();

    xhr.onload = function() {
        let data = JSON.parse(this.response);
        let output = "";

        for (let el of data) {
            output += `
                <li>
                    <a href="${el.putanja}" target="_blank">${el.sadrzaj}</a>
                </li>
            `;    
        }

        $(output).insertAfter("#folowMedia");
    }

}

var proizvodi = document.querySelector("#proizvodi");

function prikaziIndex() {
    $.ajax({
        url: "assets/data/food.json",
        dataType: "json",
        success: function(data) {

            let naj = data.slice(0,6);

            prikaziHranu(naj);
        }
    })
}


function dohvatiSveProizvode(callback) {
    $.ajax({
        url: "assets/data/food.json",
        dataType: "json",
        success: callback,
        error: function(xhr) {
            console.log(xhr);
        }
    })
}

function initPrikaz() {
    dohvatiSveProizvode(function(data) {
        let noviData = [];

        for(let i = 0; i < 6; i++) {
            noviData.push(data[i]);
        }
        
        prikaziHranu(noviData);


    });
}

function prikaziHranu(hrana) {
    
    let ispis = stampajHranu(hrana);

    proizvodi.innerHTML = ispis;

    $(".addToCart").click(upisiUStorage);
}

function stampajHranu(hrana) {
    let ispis = '';
    for (let item of hrana) {
        if(item != undefined) {
        ispis += `
            <div class="col-md-4 col-sm-6 mb-5 singleContainer">
                <div class="single-food">
                    <div class="food-img">
                        <img src="${item.img.path}" class="img-fluid" alt="${item.img.desc}" />
                    </div>
                    <div class="food-content">
                        <div class="d-flex justify-content-between">
                            <h5>${item.name}</h5>
                            <span class="style-change">$${item.price}</span>
                        </div>
                        <p class="pt-3">${item.desc}</p>
                        <div class="cart"> 
                            <button class="addToCart" href="#" data-id="${item.foodId}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div> 
        `;
        }

    }

    return ispis;
}

function popuniKategorije() {
    let output = "<option value='0'>Choose Meal</option>";

    $.ajax({
        url: "assets/data/meal.json",
        dataType: "json",
        success: function(meals) {
            for (let meal of meals) {
                output += `<option value="${meal.id}">${meal.name}</option>`;
            }

            var lista = $("#choose");

            lista.html(output);

            // lista.addEventListener("change", function(){
            //     localStorage.setItem("idKat", this.value);
            //     Number(this.value) ? filterKatEvent() : initPrikaz();
            // })

            lista.change(() => {
                let idKat = lista.val();
                sessionStorage.setItem("idKat", idKat);
                if(idKat == 0) {
                    initPrikaz();
                } else {
                    filterKatEvent();
                }
            })
            
        },
        error: function(xhr) {
            console.log(xhr);
        }
    })
}

function filterKatEvent() {
    dohvatiSveProizvode(function(data) {
        dodatniData = [];
        brojac = 2;

        data = filtrirajNizKats(data);

        data = filterKat(data);

        prikaziHranu(data);
    });
}

function filterKat(data) {
    let idKat = sessionStorage.getItem("idKat");

    if(idKat == 0 || idKat == null) {
        return data;
    } else {
        return data.filter(p => p.mealCat.id == idKat);
    }

}

// function filtrirajPoKat(kat) {
//     console.log("promena");
//     $.ajax({
//         url: "assets/data/food.json",
//         dataType: "json",
//         success: function(data) {

//             data = data.filter(x => x.mealCat.id == kat);

//             proizvodi.innerHTML = prikaziHranu(data);
//         },
//         error: function(xhr) {
//             console.log(xhr);
//         }
//     })
// }

function popuniCh() {

    $.ajax({
        url: "assets/data/mealType.json",
        dataType: "json",
        success: function(data) {
            let output = '';
        
            for (let item of data) {
                output += `
                    <label>${item.name}</label>
                    <input type="checkbox" name="kategorije" value="${item.id}" />
                 
                `;
            }
        
            // document.querySelector("#forma").innerHTML += output;

            document.querySelector("#dodatniCh").innerHTML = output;
            
            $("input[name=kategorije]").change(dodatanFilter);   

        },
        error: function(xhr) {
            console.log(xhr);
        }
    })
}

function dodatanFilter() {

    dohvatiSveProizvode(function(data) {

        dodatniData = [];
        brojac = 2; 
        
        data = filterKat(data);

        var izabranoDodatno = [];

        var chbs = document.getElementsByName("kategorije");

        for(let i = 0; i < chbs.length; i++) {
            if(chbs[i].checked) {
                izabranoDodatno.push(chbs[i].value);
            }
        }

        if(izabranoDodatno.length == 0) {
            prikaziHranu(data);
            sessionStorage.setItem("subKat", JSON.stringify(izabranoDodatno));
        } else {
            sessionStorage.setItem("subKat", JSON.stringify(izabranoDodatno))
            data = filtrirajNizKats(data);

            console.log(data);

            prikaziHranu(data);
        }

    })
}

function filtrirajNizKats(data) {
    let nizDodatneKat = JSON.parse(sessionStorage.getItem("subKat"));

    if(nizDodatneKat != null && nizDodatneKat.length != 0) {
        return data.filter(el => {
            return nizDodatneKat.some(item => item == el.mealType.id);
        });
    } else {
        return data;
    }

}

// function dodatanFilter() {
//     var izabranoDodatno = [];

//     let chbs = document.getElementsByName("kategorije");

//     for(let i = 0; i < chbs.length; i++) {
//         if(chbs[i].checked) {
//             izabranoDodatno.push(chbs[i].value);
//         }
//     }

//     $.ajax({
//         url: "assets/data/food.json",
//         dataType: "json",
//         success: function(data) {
//             if(izabranoDodatno.length) {
//                 data = data.filter(el => {
//                     return izabranoDodatno.some(item => item == el.mealType.id);
//                 });
//             }

//             if(!data.length) {
//                 proizvodi.innerHTML = `<h4>Sorry, We don't have products for selected criteria.</h4>`;
//             } else {
//                 proizvodi.innerHTML = prikaziHranu(data);
//             }

//         }
//     })
// }

function popuniSort() {
    let data = [
        {value: "New", name: "Newest"},
        {value: "Lowest", name: "Lowest Price"},
        {value: "Highest", name: "Highest Price"}
        
    ]
    let output = "";

    for (let el of data) {
        output += `
            <option value="${el.value}">${el.name}</option>
        `;
    }

    let sortType = document.querySelector("#sortType");
    sortType.innerHTML += output;
    sortType.addEventListener("change", sortirajIzbor);
}

function sortirajIzbor() {
    let izabrano = this.value;

    dohvatiSveProizvode(function(data) {
        dataFilter = filterKat(data);
        dataFilter = filtrirajNizKats(dataFilter);

        if(dataFilter.length == 0) {
            dataFilter = data;
        } 

        console.log(izabrano);

        sortFja(dataFilter, izabrano);
    })
}

function sortFja(data, izabrano) {
    let sortirani = [];
    if(izabrano == "Highest") {
        sortirani = data.sort((a,b) => b.price - a.price);
    } else if (izabrano == "Lowest") {
        sortirani = data.sort((a,b) => a.price - b.price);
    } else if(izabrano == "New") {
        sortirani = data.sort((a, b) => {
            let datum1 = new Date(a.date);
            let datum2 = new Date(b.date);

            return Date.UTC(datum2.getFullYear(), datum2.getMonth(), datum2.getDate()) - Date.UTC(datum1.getFullYear(), datum1.getMonth(), datum1.getDate());
        });
    } else {
        sortirani = data;   
    }

    prikaziHranu(sortirani);
}

function pretrazi() {
    let key = this.value.trim().toLowerCase();

    console.log(key);

    dohvatiSveProizvode(function(data) {
        data = data.filter(x => x.name.toLowerCase().includes(key));

        if(data.length) {
            prikaziHranu(data);
        } else {
            proizvodi.innerHTML = `<h4>We don't have any products for search criteria</h4>`;

            console.log(proizvodi);
        }
    })
}

function upisiUStorage() {
    var id = this.dataset.id;

    var proizvodiNiz = proizvodiUStorage();

    if(proizvodiNiz) {
        if(proizvodiNiz.includes(id)) {
           alert("Product is alredy in cart"); 
        } else {
            proizvodiNiz.push(id);
            localStorage.setItem("proizvodi", JSON.stringify(proizvodiNiz));
            counter.innerHTML = proizvodiUStorage().length;
        }
    } else {
        proizvodiNiz = [];
        proizvodiNiz.push(id);

        localStorage.setItem("proizvodi", JSON.stringify(proizvodiNiz));
        counter.innerHTML = proizvodiUStorage().length;
    }

}


function proizvodiUStorage() {
    return JSON.parse(localStorage.getItem("proizvodi"));
}

function prikaziNarudzbinu() {
    let narudzbina = proizvodiUStorage();
    $.ajax({
        url: "assets/data/food.json",
        dataType: "json",
        success: function(data) {
            data = data.filter(p => {
                for (let el of narudzbina) {
                    if(p.foodId == el) {
                        return true;
                    }
                }
                return false;
            });

            praviTabelu(data);
        },
        error: function(xhr) {
            console.log(xhr);
        }
    });

}

function praviTabelu(data) {
    console.log(data);
    var outputHtml = `
        <table class="table table-responsive">
            <thead>
                <tr>
                    <td>Product Name</td>
                    <td>Image</td>
                    <td>Price</td>
                    <td>Quantity</td>
                    <td>Sum</td>
                    <td>Remove</td>
                </tr>
            </thead>
            <tbody>
    `;

    for (let el of data) {
        outputHtml += `
            <tr>
                <td><h5>${el.name}</h5></td>
                <td>
                    <img src="${el.img.path}" alt="${el.img.desc}" class="img-fluid" />
                </td>
                <td class="price">$${el.price}</td>
                <td class="quantity">
                    <input class="form-control quantityInput" type="number" value="1"/>
                </td>
                <td class="productSum">Sum</td>
                <td>
                    <button class="btn btn-outline-danger btnRemove" data-id="${el.foodId}">Remove</button>
                </td>
            </tr>
        
        `;

    }

    outputHtml += `</tbody></table>`;
    
    document.querySelector("#orderTable").innerHTML = outputHtml;

    $(".btnRemove").click(izbrisiIzNarudzbine);
    $(".quantityInput").change(promenaKolicine);

    updateTotal();

}

function izbrisiIzNarudzbine() {
    let itemId = this.dataset.id;

    this.parentElement.parentElement.remove();

    let celaNarudzbina = proizvodiUStorage();

    celaNarudzbina = celaNarudzbina.filter(item => item != itemId);

    localStorage.setItem("proizvodi", JSON.stringify(celaNarudzbina));

    // console.log(localStorage.getItem("proizvodi"));

    updateTotal();

    // counter.innerHTML = celaNarudzbina.length;
    
}

// console.log(counter.innerHTML);

function updateTotal() {
    let cene = document.querySelectorAll(".price");
    let kolicine = document.querySelectorAll(".quantityInput");
    let productSum = document.querySelectorAll(".productSum");

    let totalSum = 0;

    for(let i = 0; i < cene.length; i++) {
        let cena = cene[i].innerHTML.replace('$','');

        productSum[i].innerHTML = "$" + Number(cena) * Number(kolicine[i].value);

        totalSum += Number(cena) * Number(kolicine[i].value);
        
    }

    console.log(totalSum);

    document.querySelector("#totalSum").innerHTML = "Total sum: $" + totalSum;
}

function promenaKolicine() {
    if(this.value > 0 ) {
        updateTotal();
    } else {
        this.value = 1;
    }
}

function prikaziPraznuNarudzbinu() {
    $("#controls").hide();
    $("#contact-form").hide();
    let ispis = `<h4 class="mt-5">Your cart is empty, go to menu page</h4>`;
    $("#orderTable").html(ispis);

}

function bookirajSto(e) {
    e.preventDefault();

    let podaci = [];
    let greske = [];

    var email = document.querySelector("#email");
    var date = document.querySelector("#date");
    var hours = document.querySelector("#hours");
    var numPeople = document.querySelector("#numPeople");

    var datum = new Date(date.value);

    var dan = datum.getDay();

    let mailRe = /^\w([\.-]?\w+\d*)*@\w+\.\w{2,6}$/;

    if(mailRe.test(email.value)) {
        podaci.push(email.value);
        email.classList.remove("border","border-danger");
    } else {
        greske.push("Email is not in good format");
        email.classList.add("border","border-danger");
        email.value = "";
        email.setAttribute("placeholder", "Enter valid email");
    }

    if(date.value == "") {
        greske.push("Morate izabrati datum");
        date.classList.add("border", "border-danger");
    } else {
        podaci.push(date.value);
        date.classList.remove("border-danger");
    }

    if(hours.value == "") {
        greske.push("Morate izabrati datum");
        hours.classList.add("border", "border-danger");
    } else {
        podaci.push(hours.value);
        hours.classList.remove("border-danger");
    }

    if(numPeople.value > 10 || numPeople.value == '') {
        greske.push("Max number of guests per table is 10");
        numPeople.classList.add("border", "border-danger");
        numPeople.value = "";
        numPeople.setAttribute("placeholder", "Max number is 10");
    } else {
        podaci.push(numPeople.value);
        numPeople.classList.remove("border", "border-danger");
    }

    let sat = hours.value.split(":")[0];

    if(dan >= 1 && dan <= 5) {
        if(sat >= 10 && sat <= 23) {
            podaci.push(sat);
        } else {
            greske.push("U to vreme smo zatvoreni");
            alert("We are closed then");
        }
    } else if(dan == 0 || dan == 6) {
        if(sat >= 8 && sat <= 22) {
            podaci.push(sat);
        } else {
            greske.push("U to vreme smo zatvoreni");
            alert("We are closed then");
        }
    }

    // ako je dan taj i taj proviri sate

    if(!greske.length) {
        alert("Your table is booked");
    } else {
        console.log(greske);
    }
}

function popuniUtiske() {
    $.ajax({
        url: "assets/data/testimonials.json",
        dataType: "json",
        success: function(data) {
            stampaj(data);
        },
        error: function(xhr) {
            console.log(xhr);
        }
    });

    function stampaj(data) {
        let outSlike = "";
        let outTest = "";

        for(let i = 0; i < data.length; i++) {
            if(i == 0) {
                outSlike += `
                    <img src="${data[i].img.src}" alt="${data[i].img.alt}" class="active pics" />
                `;
                outTest += `
                    <div class="testimonial active" id="${data[i].img.alt}">
                        <p>${data[i].content}</p>
                        <span class="description">${data[i].name}</span>
                    </div>
                `;
            } else {
                outSlike += `
                    <img src="${data[i].img.src}" alt="${data[i].img.alt}" class="pics" />
                `;
                outTest += `
                    <div class="testimonial" id="${data[i].img.alt}">
                        <p>${data[i].content}</p>
                        <span class="description">${data[i].name}</span>
                    </div>
                `;
            }
        }

        $(".testimonial-pics").html(outSlike);
        $(".testimonial-contents").html(outTest);
       
        utisci();
    }

}

function utisci() {

    $('.testimonial-pics img').click(function(){
        $(".testimonial-pics img").removeClass("active");
        $(this).addClass("active");

        console.log("KLIKCE SE");

        $(".testimonial").css("display", "none");

        $("#"+$(this).attr("alt")).fadeIn();

    });
}


let dataObjError = {
    Name: "eg. Blake Smith",
    Email: "someone@example.com",
    Subject: "Title mail",
    Message: "Enter text message",
    Street: "Some St 12"
}

var regexIme = /^[A-Z][a-z]{2,20}(\s[A-Z][a-z]{2,20})*$/;
var mailRe = /^\w([\.-]?\w+\d*)*@\w+\.\w{2,6}$/;
var subjectRe = /^[A-Z][a-z]{2,}(\s[A-z\d]{2,})*$/;

var grekse = [];
var podaciForme = [];

function proveriPolje(polje, regex) {
    let poljeId = polje.attr("id");
    if(!regex.test(polje.val())) {
        polje.css({
            'border': '2px solid #dc3545',
        });

        polje.val("");
        polje.attr("placeholder", dataObjError[poljeId]);
        greske.push(poljeId + " nije ok");
    } else {
        polje.css({
            'border': '1px solid #e6e6e6'
        });
        podaciForme.push(polje.val());
    }
}

function provera() {
    podaciForme = [];
    greske = [];

    let ime = $('#Name');
    let mail = $('#Email');
    let subject = $("#Subject");
	let msg = $('#Message');

    proveriPolje(ime, regexIme);
    proveriPolje(mail, mailRe);
    proveriPolje(subject, subjectRe);

	if(msg.val() == '') {
		msg.css({
			'border': '2px solid #dc3545',
		});

		msg.val('')
        msg.attr('placeholder', 'Message can not be empty');
        greske.push("Msg nije ok");
	} else {
		msg.css({
			'border': '1px solid #e6e6e6'
		});
		podaciForme.push(msg.val());
    }

    if(greske.length == 0) {
        alert("Email sent");

        ime.val("");
        mail.val("");
        subject.val("");
        msg.val("");
    }
}

function proveriOrder() {
    podaciForme = [];
    greske = [];
    let email = $("#Email");
    let street = $("#Street");

    let streetRe = /^\w+(\s\w+){1,}$/;  
    
    proveriPolje(email, mailRe);
    proveriPolje(street, streetRe);

    if(greske.length == 0) {
        alert("Your order is completed");
    } 
}

function galerija() {
    let output = "";
    for(let i = 1; i <= 6; i++) {
        output += `
        <div class="col-md-4 mt-5">
            <a href="assets/images/interior${i}.jpg">
                <img src="assets/images/interior${i}.jpg" alt="${i}st image" class="img-fluid" />
            </a>
        </div>
        `;
    }

    $("#galerija").html(output);

    baguetteBox.run('.gallery');

}

function kreirajXhrObj() {
    try {
        var xhrobj = new XMLHttpRequest();
    }
    catch(e) {
        try {
            xhrobj = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch(e) {
            xhrobj = new ActiveXObject("Microsoft.XMLHTTP");
        } 
    }

    return xhrobj;
}

function debounce(func, wait = 300, immediate = true) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
