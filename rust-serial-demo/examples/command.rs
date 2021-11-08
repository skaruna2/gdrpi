use std::io::{self, Write};
use std::time::Duration;

use clap::{App, AppSettings, Arg};

use serialport::{DataBits, StopBits};

fn main() {
    let matches = App::new("Serialport Example - Heartbeat")
        .about("Write bytes to a serial port at 1Hz")
        .setting(AppSettings::DisableVersion)
        .arg(
            Arg::with_name("port")
                .help("The device path to a serial port")
                .required(true),
        )
        .arg(
            Arg::with_name("baud")
                .help("The baud rate to connect at")
                .use_delimiter(false)
                .required(true)
                .validator(valid_baud),
        )
        .arg(
            Arg::with_name("stop-bits")
                .long("stop-bits")
                .help("Number of stop bits to use")
                .takes_value(true)
                .possible_values(&["1", "2"])
                .default_value("1"),
        )
        .arg(
            Arg::with_name("data-bits")
                .long("data-bits")
                .help("Number of data bits to use")
                .takes_value(true)
                .possible_values(&["5", "6", "7", "8"])
                .default_value("8"),
        )
        .arg(
            Arg::with_name("string")
                .long("string")
                .help("String to transmit")
                .takes_value(true)
                .default_value("help"),
        )
        .arg(
            Arg::with_name("verbose")
                .long("verbose")
                .help("Verbose output")
                .takes_value(true)
                .default_value("no"),
        )
        .get_matches();
    let port_name = matches.value_of("port").unwrap();
    let baud_rate = matches.value_of("baud").unwrap().parse::<u32>().unwrap();
    let stop_bits = match matches.value_of("stop-bits") {
        Some("2") => StopBits::Two,
        _ => StopBits::One,
    };
    let data_bits = match matches.value_of("data-bits") {
        Some("5") => DataBits::Five,
        Some("6") => DataBits::Six,
        Some("7") => DataBits::Seven,
        _ => DataBits::Eight,
    };
    let string = matches.value_of("string").unwrap();
    let verbose = matches.value_of("verbose").unwrap();
    let builder = serialport::new(port_name, baud_rate)
        .stop_bits(stop_bits)
        .data_bits(data_bits);
    if !verbose.eq("no") { println!("{:?}", &builder); }
    let mut port = builder.open().unwrap_or_else(|e| {
        eprintln!("Failed to open \"{}\". Error: {}", port_name, e);
        ::std::process::exit(1);
    });

    
    if !verbose.eq("no") {
        println!(
            "Writing '{}' to {} at {} baud",
            &string, &port_name, &baud_rate
        );
    }

    // send command
    let cmd = format!("{}\r\n",&string);
    match port.write(&cmd.as_bytes()) {
        Ok(_) => {
          if !verbose.eq("no") {
            print!("{}", &string);
            std::io::stdout().flush().unwrap();
          }
        }
        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
        Err(e) => eprintln!("{:?}", e),
    }

    // receive response
    let port = serialport::new(port_name, baud_rate)
        .timeout(Duration::from_millis(10))
        .open();

    match port {
        Ok(mut port) => {
            let mut serial_buf: Vec<u8> = vec![0; 1000];
            if !verbose.eq("no") { 
                println!("Receiving data on {} at {} baud:", &port_name, &baud_rate);
            }
            loop {
                match port.read(serial_buf.as_mut_slice()) {
                    Ok(t) => { 
                        io::stdout().write_all(&serial_buf[..t]).unwrap(); 
                        io::stdout().flush().unwrap(); 
                        //if String::from_utf8(serial_buf).find("\n\n\n") { break }
                    },
                    Err(ref e) if e.kind() == io::ErrorKind::TimedOut => (),
                    Err(e) => eprintln!("{:?}", e),
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to open \"{}\". Error: {}", port_name, e);
            ::std::process::exit(1);
        }
    }

    //std::thread::sleep(Duration::from_millis((1000.0 / (rate as f32)) as u64));
}

fn valid_baud(val: String) -> std::result::Result<(), String> {
    val.parse::<u32>()
        .map(|_| ())
        .map_err(|_| format!("Invalid baud rate '{}' specified", val))
}
