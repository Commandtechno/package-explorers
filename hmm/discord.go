package main

import (
	"encoding/csv"
	"io"
	"os"
	"sort"
	"time"
)

type DiscordMessage struct {
	ID          string
	Contents    string
	Attachments string
	Timestamp   time.Time
}

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

	var first DiscordMessage

	months := make([]time.Time, 0)
	monthValues := make(map[string]int)

	hours := make([]int, 0)
	hourValues := make(map[int]int)

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
			message := DiscordMessage{}
			for index, value := range row {
				header := headers[index]
				switch header {
				case "ID":
					message.ID = value

				case "Contents":
					message.Contents = value

				case "Attachments":
					message.Attachments = value

				case "Timestamp":
					timestamp, err := time.Parse("2006-01-02 15:04:05.999999Z07:00", value)
					if err != nil {
						panic(err)
					}

					message.Timestamp = timestamp
				}
			}

			if first.ID == "" || message.Timestamp.Before(first.Timestamp) {
				first = message
			}

			month := message.Timestamp.Format("2006-01")
			if value, exists := monthValues[month]; exists {
				monthValues[month] = value + 1
			} else {
				months = append(months, message.Timestamp)
				monthValues[month] = 1
			}

			hour := message.Timestamp.Hour()
			if value, exists := hourValues[hour]; exists {
				hourValues[hour] = value + 1
			} else {
				hourValues[hour] = 1
				hours = append(hours, hour)
			}
		}
	}

	monthChart := Chart{}
	monthChartDataset := ChartDataset{}

	hourChart := Chart{}
	hourChartDataset := ChartDataset{}

	sort.Slice(months, func(a int, b int) bool { return months[a].Before(months[b]) })
	sort.Slice(hours, func(a int, b int) bool { return hours[a] < hours[b] })

	for _, month := range months {
		key := month.Format("2006-01")
		monthChart.Labels = append(monthChart.Labels, key)

		value := monthValues[key]
		monthChartDataset.Data = append(monthChartDataset.Data, value)
	}

	for _, hour := range hours {
		hourChart.Labels = append(hourChart.Labels, prettyHour(hour))
		hourChartDataset.Data = append(hourChartDataset.Data, hourValues[hour])
	}

	monthChart.Datasets = append(monthChart.Datasets, monthChartDataset)
	hourChart.Datasets = append(hourChart.Datasets, hourChartDataset)

	var rows [][]Block
	var row1 []Block
	row1 = append(row1, Block{
		Type: LARGE_TEXT_TYPE,

		Title: "Total Messages",
		Data:  prettyInt(total),
	})

	row1 = append(row1, Block{
		Type: SMALL_TEXT_TYPE,

		Title: "First Message",
		Data:  "Content: " + first.Contents + "\n" + "Date: " + first.Timestamp.Format("Monday, January 2, 2006 3:04 PM"),
	})

	rows = append(rows, row1)

	var row2 []Block

	row2 = append(row2, Block{
		Type:      CHART_TYPE,
		ChartType: BAR_CHART_TYPE,

		Title: "Messages per hour",
		Data:  hourChart,
	})

	row2 = append(row2, Block{
		Type:      CHART_TYPE,
		ChartType: LINE_CHART_TYPE,

		Title: "Messages over time",
		Data:  monthChart,
	})

	rows = append(rows, row2)

	section := Section{Title: "Messages", Rows: rows}
	return section
}