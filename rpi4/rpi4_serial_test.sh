s=/dev/ttyGS0 # serial port
f=0 # initial file index

echo -en "\n\nWelcome to rpi4_serial_test!\n\n" > $s

function help_menu() {
    echo "help      - show this help menu" > $s
    echo "cpuinfo   - information about the cpu" > $s
    echo "cputemp   - cpu temperature" > $s
    echo "diskspace - system disk space usage" > $s
    echo "filesend  - save input to a file" > $s
    echo "filerecv  - receive conents of a previously sent file" > $s
    echo "uptime    - system uptime" > $s
}
function cmd_prompt() {
    command echo -en "\nEnter command: " > $s
}

help_menu
cmd_prompt

while read c < $s; do
  if [ "$c" == "help" ]; then
    help_menu
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
  #elif [ "$c" == "\r" ]; then
  #  echo # discard new lines
  else
    #echo "Invalid command" > $s
    echo -en "\n\r" > $s
  fi
  cmd_prompt
done

