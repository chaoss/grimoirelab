CACHE=perceval-cache
RAW2FILE=./raw2file.py
ES="http://bitergia:bitergia@172.17.0.1:9200"
echo Using $ES as the Elasticsearch endpoint. Adjust it to your endpoint.
$RAW2FILE -g  -p -e $ES -i functest_test-raw -f $CACHE/raw/functest.json
$RAW2FILE -g  -p -e $ES -i google_hits_test-raw -f $CACHE/raw/google_hits.json
$RAW2FILE -g  -p -e $ES -i apache_test-raw -f $CACHE/raw/apache.json
$RAW2FILE -g  -p -e $ES -i twitter_test-raw -f $CACHE/raw/twitter.json
$RAW2FILE -g  -p -e $ES -i askbot_test-raw -f $CACHE/raw/askbot.json
$RAW2FILE -g  -p -e $ES -i remo_activities_test-raw -f $CACHE/raw/remo_activities.json
