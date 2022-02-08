package main

import (
	"encoding/csv"
	"encoding/json"
	"io"
	"os"
	"sort"
	"time"
)

type Package struct {
	Title    string    `json:"title"`
	Sections []Section `json:"sections"`
}

type Section struct {
	Title string `json:"title"`
	Items []Item `json:"items"`
}

type Item struct {
	Type        string      `json:"type"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Data        interface{} `json:"data"`
}

type LineChart struct {
	Labels   []string           `json:"labels"`
	Datasets []LineChartDataset `json:"datasets"`
}

type LineChartDataset struct {
	Label string `json:"label"`
	Data  []int  `json:"data"`
}

func main() {
	packagePath := "../package_discord"
	channelsPath := packagePath + "/messages"
	channelIds, err := os.ReadDir(channelsPath)
	if err != nil {
		panic(err)
	}

	data := make(map[string]int)
	for _, channelId := range channelIds {
		if !channelId.IsDir() {
			continue
		}

		channelPath := channelsPath + "/" + channelId.Name()
		messagesPath := channelPath + "/messages.csv"
		messagesFile, err := os.Open(messagesPath)
		if err != nil {
			panic(err)
		}

		messageReader := csv.NewReader(messagesFile)
		headers, err := messageReader.Read()
		if err != nil {
			if err == io.EOF {
				break
			}

			panic(err)
		}

		for {
			row, err := messageReader.Read()
			if err != nil {
				if err == io.EOF {
					break
				}

				panic(err)
			}

			for index, value := range row {
				header := headers[index]
				switch header {
				case "Timestamp":
					date, err := time.Parse("2006-01-02 15:04:05.999999Z07:00", value)
					if err != nil {
						panic(err)
					}

					key := date.Format("2006-01")
					if currentValue, exists := data[key]; exists {
						data[key] = currentValue + 1
					} else {
						data[key] = 1
					}
				}
			}
		}
	}

	keys := make([]string, 0, len(data))
	for key := range data {
		keys = append(keys, key)
	}

	lineChart := LineChart{}
	lineChartDataset := LineChartDataset{Label: "Messages"}

	sort.Strings(keys)
	for _, key := range keys {
		lineChart.Labels = append(lineChart.Labels, key)
		lineChartDataset.Data = append(lineChartDataset.Data, data[key])
	}

	lineChart.Datasets = append(lineChart.Datasets, lineChartDataset)

	test, err := json.Marshal(lineChart)
	if err != nil {
		panic(err)
	}

	os.WriteFile("test.json", test, os.ModePerm)
}