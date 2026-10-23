
const API_KEY = "f49637476380a9b6215e38fd28fc9566";

let selectedUnit = "c";

const $ = (selector) => document.querySelector(selector);

const hourlyGrid = document.getElementById("hourly-grid");

const btnDetails = document.getElementById("btnDetails");
const detailsMeteo = document.getElementById("detailsMeteo");

btnDetails.addEventListener("click", () => {
       detailsMeteo.hidden = !detailsMeteo.hidden;
});
document.getElementById("hourly-grid").innerHTML = `
<div class="hour">
   <span>12h</span>
   <strong>27°</strong>
</div>

<div class="hour">
   <span>15h</span>
   <strong>29°</strong>
</div>
`;


function convertTemperature(value) {
       return selectedUnit === "c"
              ? Math.round(value)
              : Math.round((value * 9) / 5 + 32);
}

function degree(value) {
       return `${convertTemperature(value)}°`;
}

function weatherSymbol(kind, large = false) {
       const rain =
              kind === "rain"
                     ? `<span class="rain-drops"><i></i><i></i><i></i><i></i></span>`
                     : "";

       return `
        <span class="weather-symbol ${kind} ${large ? "large" : ""}">
            <span class="sun-disc"></span>
            <span class="cloud-shape"></span>
            ${rain}
        </span>
    `;
}

function getWeatherType(description) {
       description = description.toLowerCase();

       if (
              description.includes("rain") ||
              description.includes("pluie") ||
              description.includes("averse")
       ) {
              return "rain";
       }

       if (
              description.includes("cloud") ||
              description.includes("nuage")
       ) {
              return "cloud";
       }

       return "sun";
}

async function loadWeather(city) {
       try {
              const response = await fetch(
                     `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
              );

              if (!response.ok) {
                     throw new Error("Ville introuvable");
              }

              const data = await response.json();

              const weather = {
                     city: data.name,
                     region: data.sys.country,
                     temperature: data.main.temp,
                     feels: data.main.feels_like,
                     high: data.main.temp_max,
                     low: data.main.temp_min,
                     condition: data.weather[0].description,
                     humidity: data.main.humidity,
                     wind: Math.round(data.wind.speed * 3.6),
                     visibility: Math.round(data.visibility / 1000),
              };

              renderWeather(weather);

              loadForecast(city);

       } catch (error) {
              $("#search-notice").textContent = error.message;
              $("#search-notice").hidden = false;
       }
}

async function loadForecast(city) {
       try {
              const response = await fetch(
                     `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
              );

              const data = await response.json();

              const daily = data.list.filter(item =>
                     item.dt_txt.includes("12:00:00")
              );

              $("#listeSemaine").innerHTML = daily
                     .slice(0, 5)
                     .map(day => {
                            const type = getWeatherType(
                                   day.weather[0].description
                            );

                            const date = new Date(day.dt_txt);

                            const dayName = date.toLocaleDateString(
                                   "fr-FR",
                                   { weekday: "long" }
                            );

                            return `
                    <div class="day-row">
                        <span>${dayName}</span>
                        ${weatherSymbol(type)}
                        <span class="day-temp">
                            <strong>${degree(day.main.temp_max)}</strong>
                            <small>${degree(day.main.temp_min)}</small>
                        </span>
                    </div>
                `;
                     })
                     .join("");
       } catch (error) {
              console.error(error);
       }
}
function renderWeather(weather) {
       const type = getWeatherType(weather.condition);

       $("#nomVille").textContent = weather.city;
       $("#nomRegion").textContent = weather.region;

       $("#current-temperature").textContent = degree(weather.temperature);
       $("#condition").textContent = weather.condition;
       $("#temperature-range").textContent =
              `${degree(weather.high)} / ${degree(weather.low)}`;

       $("#summary").textContent =
              `Temps actuel à ${weather.city}`;

       $("#impression").textContent = degree(weather.feels);
       $("#humidity").textContent = `${weather.humidity}%`;
       $("#wind").textContent = `${weather.wind} km/h`;
       $("#visibility").textContent = `${weather.visibility} km`;

       $("#hero-weather").innerHTML =
              weatherSymbol(type, true);

       // détails
       $("#detailsHumidity").textContent = `${weather.humidity}%`;
       $("#detailsWind").textContent = `${weather.wind} km/h`;
       $("#detailsVisibility").textContent = `${weather.visibility} km`;
       $("#detailsFeels").textContent = degree(weather.feels);
       $("#detailsCondition").textContent = weather.condition;
}

$("#dateJour").textContent =
       new Intl.DateTimeFormat("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
       }).format(new Date());

$("#search-form").addEventListener("submit", (event) => {
       event.preventDefault();

       const city = $("#introduireVille").value.trim();

       if (!city) return;

       loadWeather(city);

       $("#search-notice").hidden = true;
       $("#introduireVille").value = "";
});

document.querySelectorAll("[data-unit]").forEach(button => {
       button.addEventListener("click", () => {
              selectedUnit = button.dataset.unit;

              document
                     .querySelectorAll("[data-unit]")
                     .forEach(btn => {
                            btn.classList.toggle(
                                   "active",
                                   btn === button
                            );
                     });

              const city =
                     $("#nomVille").textContent || "Paris";

              loadWeather(city);
       });
});

loadWeather("Thies");