# Rust-Serial-Demo

Besides receive_data_flush, all examples are from the 
serialport-rs crate which can be found here: 

https://github.com/Susurrus/serialport-rs

The receive_data_flush was copied from receive_data, but with 
the added call to io::stdio::flush() after each write. Without
this, the data never appears.

## Setup

### On rpi4 and host
```
sudo apt get pkg-config
sudo apt get libudev-dev
# on rpi4
sudo chmod a+rw /dev/ttyGS0 
# on host device
sudo chmod a+rw /dev/ttyACM0
```

### Transmit from rpi4 to host device
```
# on host device
cargo run --example receive_data_flush /dev/ttyACM0 9600
```
```
# on rpi4
cargo run --example transmit /dev/ttyGS0 9600 --string "hello "
```

### Transmit from host device to rpi4
```
# on rpi4
cargo run --example receive_data_flush /dev/ttyGS0 9600
```
```
# on host device
cargo run --example transmit /dev/ttyACM0 9600 --string "hello "
```
