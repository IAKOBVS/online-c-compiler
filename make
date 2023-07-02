#!/bin/sh
if [ -f /usr/bin/gcc ]; then
	compiler=gcc
elif [ -f /usr/bin/clang ]; then
	compiler=clang
else
	echo 'gcc/clang not available'
	exit 1
fi
cmd="$compiler -march=native -O3 ./src/write_to_file.c -o ./bin/write_to_file"
$cmd
echo "$cmd"
