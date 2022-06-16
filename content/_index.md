+++
title = "Announcing Reference Architecture for AI"
description = "This is the reference architecture for AI to start collaboration and discussion."
+++

# Introduction 
There are tools for advanced analytics, including free ones from Google and Kaggle.

There are well-known and validated deployment architectures for applications and the cloud.

Yet the number of practical applications is still tiny, and they retained niche implementations.
While the benefits of AI are clear, there are still many gaps in AI architecture that need to be filled. For example, there is a gap between analytical tools and verified architectures for real-time deployments. This gap often stems from a lack of specific reference architectures and patterns, demonstrating the trade-offs between technologies, libraries, and tools.

Let's bridge the gap in knowledge and drive a connection between science and engineering to make fast, efficient, and practical AI deployments.

Three things need to be in place to build an AI product:

1) AI Product itself
2) Core Capabilities required to build AI/ML product
3) Enabling capabilities

I will use [The Pattern](https://thepattern.digital/), my [“Build on Redis” Hackathon prize winning](https://redis.com/blog/build-on-redis-hackathon-winners/) [open source](https://github.com/applied-knowledge-systems/the-pattern) project to illustrate how capabilities below can be implemented and invite you to [contribute](/docs/contribution/) or [donate](/docs/donate).

Diagrams below are clickable.

# AI Product

<a href="./docs/ai-product/"><img src="/images/ai_product.drawio.svg" /></a>

# Core capabilities for AI/ML 

{% mermaid() %}
flowchart LR; 
subgraph " "
  data_intake(Data Acquisition);
  data_preprocessing(Data Preprocessing);
  data_validation(Data Validation);
  data_streaming(Data Streaming);
  ai_ml_pipe(AI ML Pipeline <br/> Model Training/Test/Validation);
  kg(Knowledge Graph);
  ML_inference(ML Inference);
  interaction(Interaction Layer<br/>Voice/VR/AR/Meta);
  click data_intake "./docs/intake/" "Data Acquisition"
  click ML_inference "./docs/bert-qa-benchmarking/" "BERT Large Question Answering"
  click kg "./docs/nlp/#what-is-a-knowledge-graph" "Knowledge Graph"
  click data_preprocessing "./docs/nlp/#redisgears-for-nlp-pre-processing" "Data pre-processing"
  click data_streaming "./docs/nlp/#goal" "Data Streaming"
  click ai_ml_pipe "./docs/nlp/#overall-architecture-overview-components-diagram" "Overall ML pipeline"
end
{% end %}
# Enabling Capabilities 

{% mermaid() %}
flowchart LR;
subgraph 2 [Enabling Capabilities]
  subgraph " "
D1[Data Governance]
D2[Data Quality Management]
D3[Metadata Management]
click D3 "/docs/metadata/" "Metadata Management"
end
subgraph " "
  id2[ML performance and bias monitoring];
  id3[Application Performance Monitoring];
  id4[Hardware Performance Monitoring];
  click id3 "/docs/bert-qa-benchmarking/#running-benchmarks" "Running Benchmarks"
  click id4 "/docs/bert-qa-benchmarking/#using-graphana-to-monitor-redisgears-throughput-cpu-and-memory-usage" "CPU and Memory Benchmarks"
end
subgraph " "
  id5[DevOps: Continious Integration/<br>Continious Deployment];
  c1[Configuration management]
  c2[Collaboration and knowledge management tooling]
  c3[Change Management]
end 
  
  subgraph 3 [Self Serving Infrastructure]
    s1[Computing Infrastructure]
    s2[Serving infrastructure]
  end

  end
  style 2 fill:#485fc754,stroke:#333,stroke-width:4px;
{% end %}