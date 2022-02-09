package main

import (
	"encoding/json"
	"os"
)

func main() {
	packagePath := "../package_discord"
	_package := Discord(packagePath)

	// rawPackage, err := json.Marshal(_package)
	rawPackage, err := json.MarshalIndent(_package, "", "  ")
	if err != nil {
		panic(err)
	}

	os.WriteFile("package.json", rawPackage, os.ModePerm)
}