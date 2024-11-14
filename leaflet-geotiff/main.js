document.addEventListener("DOMContentLoaded", () => {
    let projection;

    // Define the projection if not already set
    const getProjection = () => {
        if (!projection) {
            // Define EPSG:25289 alias in proj4 taking values from https://epsg.io/25829
            proj4.defs(
                "EPSG:25829",
                "+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
            );
            // EPSG:4326 is defined by default
            projection = proj4("EPSG:4326", "EPSG:25829");
        }
        return projection;
    };

    const getReprojectedCoords = latlng => {
        const proj = getProjection();
        return proj.forward({x: latlng.lng, y: latlng.lat});
    };

    const addImageOverlay = map => {
        const bounds = [
            {lng: -8.8552392, lat: 42.3347327},
            {lng: -8.5189099, lat: 42.1652488},
        ];
        L.imageOverlay("output.png", bounds, {opacity: 0.6}).addTo(map);
    };

    const loadGeoTIFFImage = async url => {
        const tiff = await GeoTIFF.fromUrl(url);
        return tiff.getImage();
    };

    const updateDisplay = ({latlng, xyCoords, pixelCoords, pixelValue}) => {
        const formatLatLng = coords => [coords.lng.toFixed(3), coords.lat.toFixed(3)];
        const formatXYCoords = coords => [Math.round(coords.x), Math.round(coords.y)];
        const formatPixelCoords = coords => coords.map(coord => Math.round(coord));
        const formatPixelValue = value => pixelValue.toFixed(2);

        const _latlng = formatLatLng(latlng);
        const _xyCoords = formatXYCoords(xyCoords);
        const _pixelCoords = formatPixelCoords(pixelCoords);
        const _pixelValue = formatPixelValue(pixelValue);

        document.getElementById("original-point").innerText = _latlng;
        document.getElementById("reprojected-point").innerText = _xyCoords;
        document.getElementById("pixel-coords").innerText = _pixelCoords;
        document.getElementById("value-result").innerText = _pixelValue;
    };

    const initializeMap = async () => {
        const map = L.map("map").setView([42.25, -8.69], 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        addImageOverlay(map);

        const image = await loadGeoTIFFImage("output.tif");

        map.on("click", async event => handleMapClick(event, image));
    };

    const handleMapClick = async ({latlng}, image) => {
        const xyCoords = getReprojectedCoords(latlng);
        const pixelCoords = calculatePixelCoords(xyCoords, image);
        const pixelValue = await getPixelValue(image, pixelCoords);

        updateDisplay({latlng, xyCoords, pixelCoords, pixelValue});
    };

    const calculatePixelCoords = (xyCoords, image) => {
        const {x, y} = xyCoords;
        const [originX, originY] = image.getOrigin();
        const [xRes, yRes] = image.getResolution();

        const pixelX = Math.floor((x - originX) / xRes);
        const pixelY = Math.floor((y - originY) / yRes);

        return [pixelX, pixelY];
    };

    const getPixelValue = async (image, [pixelX, pixelY]) => {
        const [value] = await image.readRasters({
            interleave: true,
            window: [pixelX, pixelY, pixelX + 1, pixelY + 1],
            samples: [0],
        });
        return value;
    };

    initializeMap();
});
