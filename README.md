# Table of Contents

1. [Elanco Parasite Risk Map](#EPRM)
2. [Project Description](#PDElanco)
3. [Tech Stack](#TechStack)
   1. [API's And Required Extras](#API)
4. [How Score is Determined](#HSID)

# Elanco Parasite Risk Map

    An HTML Webpage to display and track the parasite risk in cattle within the UK.

[Our Deployed Page](https://pelwis01.github.io/Elanco_Project/Index.html)

## Project Description

Our client challenged us to create a interactive map, which should be easy to interpret and understandable for farmers.

![Heatmap](/Elanco_Project/images/image.png)

Doing this we implemented a Heatmap that shows a clear colour gradient and easy to read key value. The heatmap works by displaying the calculated risk score and overlaying it on top of the UK based on longitude/Latitude points.

## Tech Stack <a name="TechStack"></a>

Our chosen tech stack for this project is:

    HTML
    JavaScript
    CSS

We focused on using a bareboned approach when it came to tech stack to allow for easier deployment on GitHub Pages.

### API's And Required Extras

---

Although basic tech stack was used, we also used multiple libraries to help provide data as well as gather the data in real time.

These are:

    Leaflet.js (v1.9.4) + CSS
        Additional Plugins:
        - Leaflet Geosearch + CSS (v3.0.0)
        - Leaflet Heatmap + CSS
    Plotly

    OpenMeteo Weather Forecast API (v1)
    OpenMeteo Elevation API (v1)
    MapBox API (API Key Required)

We have also created a file with UK Lat Lon values to iterate through to allow for easier Mapping.

## How Score is Determined

    Placeholder text


