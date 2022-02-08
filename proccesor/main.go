package main

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