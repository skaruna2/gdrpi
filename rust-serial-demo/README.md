# rust-serial-demo

Besides receive_data_flush.rs and command.rs, all examples are from the 
serialport-rs crate which can be found here: 

https://github.com/Susurrus/serialport-rs

The receive_data_flush.rs was copied from receive_data.rs, but with 
the added call to io::stdio::flush() after each write. Without
this, the data never appears.

The command.rs is a combination of transmit.rs and receive_data_flush.rs.
It transmits a command and receives the response. 

## Test Transmit and Receive with Rust

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

## Issue commands to rpi4_serial_test.sh script
```
# on rpi4
cd rpi4
chmod +x rpi4_serial_test.sh
./rpi4_serial_test.sh clean
```
```
# on host device
cd rpi4/rust-serial-demo
cargo run --example command /dev/ttyACM0 9600 --string help
cargo run --example command /dev/ttyACM0 9600 --string uptime
cargo run --example command /dev/ttyACM0 9600 --string cputemp
cargo run --example command /dev/ttyACM0 9600 --string diskspace
cargo run --example command /dev/ttyACM0 9600 --string sysinfo
```
