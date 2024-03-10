# OSU_Bachelor_Thesis - Client

Client part of the OSU Bachelor's Thesis "Digitization of school timetables for teaching rooms" (2023/24)

## Development

### Prerequisites

Hardware you need:

- [ESP32](https://github.com/SmartArduino/SZDOITWiKi/wiki/ESP8266---ESP32),
- [Waveshare 6inch E-Ink display](https://www.waveshare.com/wiki/6inch_HD_e-Paper_HAT)

You need to have installed:

- [Espressif ESP-IDF v5.2.1](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/)

### Getting started

Have server from [server](../server) running locally.

Then IN ONE TERMINAL run to setup the toolchain.

```
. $HOME/esp/esp-idf/export.sh
```

Setup environment variables.

```
cp ./main/env.example.h ./main/env.h
```

And update them accordingly to your environment, `ESP_DEVICE_ID` and `ESP_DEVICE_SECRET` should be generated after you register your device on the web interface.

Build.

```
idf.py build
```

Flash.

```
idf.py -p /dev/cu.usbserial-0001 flash
```

## Production

Same as development, but you need to set the environment variables accordingly to the production environment.
