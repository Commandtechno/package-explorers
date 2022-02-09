package main

import "strconv"

func prettyInt(i int) string {
	str := strconv.Itoa(i)
	length := len(str)
	newStr := ""
	for i := 0; i < length; i++ {
		if (length-i)%3 == 0 && i != 0 {
			newStr += ","
		}

		newStr += string(str[i])
	}

	return newStr
}

func prettyHour(hour int) string {
	if hour == 0 {
		return "12am"
	}

	if hour == 12 {
		return "12pm"
	}

	if hour > 12 {
		return strconv.Itoa(hour-12) + "pm"
	}

	return strconv.Itoa(hour) + "am"
}