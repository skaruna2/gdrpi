# run with arg1 == clean to suppress menu and command prompt
s=/dev/ttyGS0 # serial port
f=0 # initial file index


function help_menu() {
    echo "help      - show this help menu" > $s
    echo "cpuinfo   - information about the cpu" > $s
    echo "cputemp   - cpu temperature" > $s
    echo "diskspace - system disk space usage" > $s
    echo "filesend  - save input to a file" > $s
    echo "filerecv  - receive conents of a previously sent file" > $s
    echo "sysinfo   - system information from landscape-sysinfo" > $s
    echo "uptime    - system uptime" > $s
}
function cmd_prompt() {
    command echo -en "\nEnter command: " > $s
}

if [[ $1 != "clean" ]]; then
    echo -en "\n\nWelcome to rpi4_serial_test!\n\n" > $s
    help_menu
    cmd_prompt
fi

while read c < $s; do
  if [ "$c" == "help" ]; then
    help_menu
  elif   [ "$c" == "sysinfo" ]; then
    landscape-sysinfo > $s
  elif   [ "$c" == "diskspace" ]; then
    df -H > $s
  elif [ "$c" == "cpuinfo" ]; then
    cat /proc/cpuinfo > $s
  elif [ "$c" == "uptime" ]; then
    uptime > $s
  elif [ "$c" == "cputemp" ]; then
    # https://www.pragmaticlinux.com/2020/06/check-the-raspberry-pi-cpu-temperature/
    t=$(head -n 1 /sys/class/thermal/thermal_zone0/temp | xargs -I{} awk "BEGIN {printf \"%.2f\n\", {}/1000}")
    echo "CPU Temperature: $t degrees Celsius" > $s
  elif [ "$c" == "filesend" ]; then
    echo -n "Enter number of bytes to write: " > $s
    read n < $s
    if [[ "$n" =~ ^-?[0-9]+$ ]] ; then # test for integer
        t=$(tempfile)
        files[$f]=$t ; 
        echo "Saving next $n bytes to File Index $f" > $s
        dd if=$s of=$t count=$n bs=1 2> $s > $s
        f=$(($f + 1)) # increment file index
    else
        echo "Invalid number of bytes" > $s
    fi
  elif [ "$c" == "filerecv" ]; then
    echo -n "Enter File Index of file to read: " > $s
    read n < $s
    if [[ "$n" =~ ^-?[0-9]+$ ]] ; then # test for integer
        if [ "${files[$n]}" != "" ]; then
            cat ${files[$n]} > $s
            echo "" > $s
        else 
            echo "Invalid file index" > $s
        fi
    else 
        echo "Invalid file index" > $s
    fi
  else
    # ignore invalid commands
    echo -en "\n\r" > $s
  fi
  if [[ $1 != "clean" ]] ; then
    cmd_prompt
  fi
done

