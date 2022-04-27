# Arizona State University CS/CSE Capstone Project FA2021-SP2022
# General Dynamics - Use of Raspberry Pi for Network Configuration

## Raspberry Pi Setup

### Install Ubuntu on the SD card, setup network and connect with SSH
https://ubuntu.com/tutorials/how-to-install-ubuntu-on-your-raspberry-pi

This will use the [Raspberry Pi Imager](https://www.raspberrypi.com/software/).

### Enable Gadget Serial
- Within the Raspberry Pi 4, edit these files:
- Edit `/boot/firmware/config.txt`
    - Add a new line at the end of the file which contains: `dtoverlay=dwc`
    - Skip this step if `dtoverlay=dwc2` is already present
- Edit `/boot/firmware/cmdline.txt`
    - Append ` modules-load=dwc2,g_serial` to the end of the line. Place a space before `modules`.

To utilze the Gadget Serial port, connect a USB cable from your computer to the RPI4 USB-C port. It works with USB-C to USB-C or USB-A to USB-C. The important part is to connect to the USB-C port of the RPI4. Meantime, you should still maintain a connection to the RPI4 using a network cable or WiFi

Reboot the RPI4 and reconnect using SSH

### Install Rust
https://www.rust-lang.org/tools/install

After Rust is installed, some extra packages are required for you to be able to compile Rust projects.
```bash
sudo apt update
sudo apt install build-essential        # Rust needs a C linker to compile projects
sudo apt install libudev-dev pkg-config # Necessary packages for Rust compilation
```

### Helpful packages
If you would like to use `ifconfig`, install this package.
```bash
sudo apt install net-tools
```

## Basic Testing
On the RPI4:
```bash
sudo cat /dev/ttyGS0
```
From the connected computer:
```bash
sudo echo "Test from host computer" > /dev/ttyACM0
```
You should see the message appear in the RPI4 terminal.

## Basic Serial Console
On the RPI4:
```bash
systemctl enable serial-getty@ttyGS0.service
systemctl start serial-getty@ttyGS0.service
```
From the connected computer:
```bash
sudo screen /dev/ttyACM0 9600
```
This will launch a terminal and prompt a login just as if you connected with SSH.

Disable the serial console before implementing the code in this repository
```bash
systemctl stop serial-getty@ttyGS0.service
systemctl disable serial-getty@ttyGS0.service
```

## Code in this Repository
- rpi4_serial_test.sh - Runs on the RPI4 and responds to selected command inputs, demonstrates simple file transfer capability, used for testing additional modules
- rust-serial-demo - Examples can be run on target RPI4 and connecting devices. Use to test serial communication implemented by Rust programming language.
- rust-wasm-test - A basic Web Assembly example which will be used as a framework for issuing commands such as those in rpi4_serial_test.sh
- PrometheousMetrics - Implementation of Prometheous monitoring system on RPI4
- FrontEnd-Login - Basic Svelte Login page implemented with Svelte

## Additional Configuration
To access the ports as a non-root user:
```bash
# On the RPI4:
sudo chmod a+rw /dev/ttyGS0
# On the connecting host:
sudo chmod a+rw /dev/ttyACM0
```
## Additional Resources

https://svelte.dev/tutorial/basics \
https://www.rust-lang.org/what/wasm \
https://rustwasm.github.io/docs/book/ \
https://github.com/bytecodealliance/wasmtime \
https://wasmer.io/wasmer-vs-wasmtime \
https://www.toptal.com/webassembly/webassembly-rust-tutorial-web-audio \
