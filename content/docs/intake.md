+++
title = "Data Acquisition" 
description = "Data Acquisition: Data Ingestion or Data Intake"
date = 2020-08-31
[taxonomies]
categories = ["intake","data acquisition"]
tags = ["data", "acquisition","intake"]

[extra]
comments = false
+++

For the Reference Architecture for AI, we used Kaggle [Cord19 dataset](https://www.kaggle.com/datasets/allen-institute-for-ai/CORD-19-research-challenge), "COVID-19 Open Research Dataset (CORD-19). CORD-19 is a resource of over 1,000,000 scholarly articles, including over 400,000 with full text, about COVID-19, SARS-CoV-2, and related coronaviruses. This freely available dataset is provided to the global research community to apply recent advances in natural language processing and other AI techniques to generate new insights in support of the ongoing fight against this infectious disease."

# Ingest documents
[Example script](https://github.com/applied-knowledge-systems/the-pattern-platform/blob/6fe80e7bf6c8c3baf2d1bd6aa300ff1ef336d523/RedisIntakeRedisClusterSample.py) parses documents taking out body_text and saves under paragraphs in Redis cluster.