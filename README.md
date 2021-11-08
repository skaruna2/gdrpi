# Arizona State University CSE 485/423 Capstone Project FA2021-SP2022
# General Dynamics - Use of Raspberry Pi for Network Configuration

## Raspberry Pi Setup

### Download Ubuntu Linux
https://ubuntu.com/download/raspberry-pi
Ubuntu Server 20.04.3 LTS - 64-bit
Direct download link: https://ubuntu.com/download/raspberry-pi/thank-you?version=20.04.3&architecture=server-arm64+raspi

### Install Ubuntu on the SD card, setup network and connect with SSH
https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi#1-overview

### Enable Gadget Serial
Within the Raspberry Pi 4, edit these files:
Edit /boot/firmware/config.txt  
Add a new line at the end of the file with "dtoverlay=dwc2"
Edit /boot/firmware/cmdline.txt  
Append " modules-load=dwc2,g_serial" to the end of the line

To utilze the Gadget Serial port, connect a USB cable from your computer to the RPI4 USB-C port. It works with USB-C to USB-C or USB-A to USB-C. The important part is to connect to the USB-C port of the RPI4. Meantime, you should still maintain a connection to the RPI4 using a network cable or WiFi

Reboot the RPI4 and reconnect using SSH

## Basic Testing
On the RPI4:
```
sudo cat /dev/ttyGS0
```
From the connected computer:
```
sudo echo "Test from host computer" > /dev/ttyACM0
```
You should see the message appear in the RPI4 terminal.

## Serial Console
On the RPI4: 
```
systemctl enable serial-getty@ttyGS0.service
systemctl start serial-getty@ttyGS0.service
```
From the connected computer: 
```
sudo screen /dev/ttyACM0 9600
```
This will launch a terminal and prompt a login just as if you connected with SSH. 

## Additional Resources

https://svelte.dev/tutorial/basics
https://www.rust-lang.org/what/wasm
https://rustwasm.github.io/docs/book/
https://github.com/bytecodealliance/wasmtime
https://wasmer.io/wasmer-vs-wasmtime
https://www.toptal.com/webassembly/webassembly-rust-tutorial-web-audio
