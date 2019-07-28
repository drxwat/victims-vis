library(dplyr)
library(ggplot2)
library(magrittr)
library(ggpubr)

data = readRDS('./rcvs_dataset_2019-06-21.Rds')

victims = data %>% filter(resp_is_crime_victim == 1)

web_subset = victims %>% select(
  resp_is_male, 
  resp_age, 
  crime_type,
  crime_place_grouped,
  resp_income,
  resp_place_is_city,
  resp_edu,
  resp_ses,
  victim_is_reporting,
  victim_is_crime_case_initiated
  )
write.csv(web_subset, file = './src/assets/web_subset.csv', row.names = FALSE)


