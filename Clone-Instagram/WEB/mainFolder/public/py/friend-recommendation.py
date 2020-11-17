import sys
import json
import base64
import pymysql
import pandas as pd
import numpy as np
from ast import literal_eval
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity




user=sys.argv[1]
db=pymysql.connect(
    user='root',
    passwd='dlwhwnzjqjrm',
    host='localhost',
    db='instagram',
    charset='utf8'
)

cursor=db.cursor(pymysql.cursors.DictCursor)

sql="select user.id, ifnull(f.follow,'0') as follow from user left join (select id,group_concat(following_id) as follow from (select * from following where id!=following_id) as f group by id) as f on user.id=f.id;"

cursor.execute(sql)
result=cursor.fetchall() #DB에서 user_post 받아오기

user_post_df=pd.DataFrame(result) #받아 온 값을 dataframe형식으로 변환
user_post_df['follow']=user_post_df['follow'].str.split(',') # ','로 나눔
user_post_df[['follow']][:1]
# countvectorizer? 문서 집합에서 단어 토큰을 생성하고 각 단어의 수를 세어 BOW 인코딩한 벡터를 만듬
# CountVectorizer를 적용하기 위해 공백문자로 word 단위가 구분되는 문자열로 변환.
user_post_df['follow_literal']=user_post_df['follow'].apply(lambda x:(' ').join(x))

#follow 문자열을 Count 백터화(나눈 문자의 출현 빈도를 세어 벡터(집함)로 변환)
try:
    count_vect=CountVectorizer(min_df=0,ngram_range=(1,2))#min_df = 최소 비교문자 , ngram_range = 
    follow_mat=count_vect.fit_transform(user_post_df['follow_literal'])
except ValueError:
    count_vect=CountVectorizer(min_df=0,ngram_range=(0,2))
    follow_mat=count_vect.fit_transform(user_post_df['follow_literal'])

#각 id에 따른 팔로우별 cosine유사도 추출(백터 사이의 각도만으로 유사도를 추출)
follow_sim=cosine_similarity(follow_mat,follow_mat)

follow_sim_sorted_ind=follow_sim.argsort()[:,::-1]#index로 정렬 (::-1은 전체를 역순으로 조회)

#유사도가 높은 id를 찾아 반환
def find_sim_follow(df,sorted_ind,id):
    user_id=df[df['id']==id]
    id_index=user_id.index.values
    
    result_ind=[]
    user_id_follow=user_id['follow'].tolist()[0]
    for x in df['id']:
        if x in user_id_follow:
            result_ind.append(df[df['id']==x].index.values)
        else:
            continue
    
    result_ind=np.array(result_ind).reshape(-1).tolist()
    similar_indexes=sorted_ind[id_index,:]
    similar_indexes=similar_indexes.reshape(-1)#해당 열(index)만 따로 저장
    similar_indexes = similar_indexes[similar_indexes != id_index]
    similar_df=df.iloc[similar_indexes]#해당 index에 대한 아이디를 저장
    similar_df=similar_df.drop(result_ind)
    count_list=[]
    user_id_list=user_id['follow'].tolist()
    similar_df_list=similar_df['follow'].tolist()
    i=0
    #함께아는 친구 계산
    for i in range(len(similar_df_list)):
        count=0
        for x in similar_df_list[i]:#추천된 사람을 한 명씩 호출해 그 사람이 팔로우 한 사람을 찾음
            for y in user_id_list[0]:#자신이 팔로우한 사람
                if x=='0' and y=='0':
                    continue
                if x in y:#자신이 팔로우한 사람과 추천된 사람의 팔로우를 비교
                    count=count+1
        i=i+1
        count_list.append(count)
                    
    similar_df['together']=count_list
    return similar_df

similar_id=find_sim_follow(user_post_df,follow_sim_sorted_ind,user)[:20]
similar_id=json.dumps(dict(np.array(similar_id[['id','together']]).tolist()))
# print(json.dumps(dict({user:[1,2,3]})))
print(similar_id)

# 