# Leaflet, geotiff.js and Cloud Optimized GeoTIFF

Traditionally, when we wanted to work with raster information such as an elevation map (DEM) or temperature map in a web viewer, we depended on using a backend like GeoServer. But for a few years now, formats like Cloud Optimized GeoTiff and libraries like `geotiff.js` have allowed us to do this only with client-side technologies in many use cases.

In this example we see how to obtain the pixel value of a DEM when clicking on a web viewer made with Leaflet and how to paint it in a coarse way that is sufficient in many cases.

For more information, see related articles on the [iCarto blog](https://icarto.es/blog/)

## Quick instructions

Download a DEM. We will call it `PNOA_MDT25_ETRS89_HU29_0223_LID.tif` in the examples.

Generate a COG

```bash
gdal_translate -a_srs EPSG:25829 -of COG \
    -co COMPRESS=DEFLATE -co LEVEL=9 -co PREDICTOR=YES \
    -co NUM_THREADS=ALL_CPUS --config GDAL_CACHEMAX 1500 --config GDAL_NUM_THREADS ALL_CPUS \
    \ -co BLOCKSIZE=128
    -co OVERVIEWS=NONE  PNOA_MDT25_ETRS89_HU29_0223_LID.tif output.tif
```

Generate a PNG

```bash
gdalwarp -t_srs EPSG:4326 PNOA_MDT25_ETRS89_HU29_0223_LID.tif pnoa25_4326.tif
gdaldem color-relief -alpha -compute_edges -of png -co ZLEVEL=9 pnoa25_4326.tif magma-color-relief.dat output.png
```

Use a local webserver to serve this web app:

```bash
npx http-server
```

Navigate to http://localhost:8080/
