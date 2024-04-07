# OSU_Bachelor_Thesis - Client

Client part of the OSU Bachelor's Thesis "Digitization of school timetables for teaching rooms" (2023/24)

## Development

### Prerequisites

Hardware you need:

- [Raspberry Pi 4B](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/specifications/),
- [Waveshare 6inch E-Ink display](https://www.waveshare.com/wiki/6inch_HD_e-Paper_HAT)

### Getting started

Have server from [server](../server) running locally.

On your display, set the DIP switch to SPI mode.

Install bcm2835 libraries - recommended for Pi4, for other models follow the [waveshare wiki](https://www.waveshare.com/wiki/6inch_HD_e-Paper_HAT#Working_with_Raspberry_Pi_.28SPI.29).

```
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.60.tar.gz
tar zxvf bcm2835-1.60.tar.gz
cd bcm2835-1.60
./configure
make
sudo make check
sudo make install
```

Enable SPI interface.

```
sudo raspi-config
```

Navigate to `Interfacing Options` -> `P4` -> `SPI` -> `Yes` -> `Ok` -> `Finish`.

Setup environment variables.

```
cp ./main/environment.example.h ./main/environment.h
```

And update them accordingly to your environment, `ESP_DEVICE_ID` and `ESP_DEVICE_SECRET` should be generated after you register your device on the web interface.

Install dependencies.

```
sudo apt-get install libcurl4-openssl-dev libpng-dev
```

Build and check if everything is working.

```
sudo make clean
sudo make -j4
```

Check VCOM voltage on FPC connector and use it as a parameter for the executable - in my case it was -2.13.

```
sudo ./epd -2.13 0
```

## Production

Same as development, but you need to set the environment variables accordingly to the production environment.
