package main

import (
	"os"

	"github.com/alxflam/kingraph-go/internal/cli"
)

func main() {
	if err := cli.Execute(); err != nil {
		os.Exit(1)
	}
}
