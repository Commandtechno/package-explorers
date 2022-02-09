package main

type Package struct {
	Title    string    `json:"title"`
	Sections []Section `json:"sections"`
}

type Section struct {
	Title  string  `json:"title"`
	Blocks []Block `json:"blocks"`
}

type Block struct {
	Type      string `json:"type"`
	ChartType string `json:"chart_type"`

	Title string      `json:"title"`
	Data  interface{} `json:"data"`
}

type Chart struct {
	Labels   []string       `json:"labels"`
	Datasets []ChartDataset `json:"datasets"`
}

type ChartDataset struct {
	Data []int `json:"data"`
}