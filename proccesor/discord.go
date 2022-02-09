package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"sort"
	"time"
)

func Discord(packagePath string) Package {
	var sections []Section

	messages := DiscordMessages(packagePath)
	sections = append(sections, messages)

	_package := Package{Title: "Discord", Sections: sections}
	return _package
}

func DiscordMessages(packagePath string) Section {
	channelsPath := packagePath + "/messages"
	channelIds, err := os.ReadDir(channelsPath)
	if err != nil {
		panic(err)
	}

	total := 0
	dates := make([]time.Time, 0)
	values := make(map[string]int)

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

			total++
			for index, value := range row {
				header := headers[index]
				switch header {
				case "Timestamp":
					date, err := time.Parse("2006-01-02 15:04:05.999999Z07:00", value)
					if err != nil {
						panic(err)
					}

					key := date.Format("2006-01")
					if value, exists := values[key]; exists {
						values[key] = value + 1
					} else {
						dates = append(dates, date)
						values[key] = 1
					}
				}
			}
		}
	}

	lineChart := LineChart{}
	lineChartDataset := LineChartDataset{Label: "Messages"}

	sort.Slice(dates, func(a int, b int) bool { return dates[a].Before(dates[b]) })

	for _, date := range dates {
		key := date.Format("2006-01")
		lineChart.Labels = append(lineChart.Labels, key)

		value := values[key]
		lineChartDataset.Data = append(lineChartDataset.Data, value)
	}

	lineChart.Datasets = append(lineChart.Datasets, lineChartDataset)

	var blocks []Block
	blocks = append(blocks, Block{
		Type:      "text",
		ChartType: LINE_CHART_TYPE,

		Title: "Total Messages",
		Data:  fmt.Sprintf("%d", total),
	})

	blocks = append(blocks, Block{
		Type:      "chart",
		ChartType: LINE_CHART_TYPE,

		Data: lineChart,
	})

	section := Section{Title: "Messages", Blocks: blocks}
	return section
}