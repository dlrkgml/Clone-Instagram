import pandas as pd
import numpy as np
import pymysql
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error
import json
import sys
import warnings
warnings.filterwarnings("ignore")
user=sys.argv[1]

db=pymysql.connect(
    user='root',
    passwd='dlwhwnzjqjrm',
    host='localhost',
    db='instagram',
    charset='utf8'
)

cursor=db.cursor(pymysql.cursors.DictCursor)
cursor2=db.cursor(pymysql.cursors.DictCursor)
cursor3=db.cursor(pymysql.cursors.DictCursor)
try:
    #like를 누른 Id조회
    sql="select user.id,post_likes.post_id from user left join post_likes on user.id=post_likes.likes_id;"
    cursor.execute(sql)
    result=cursor.fetchall()
    post_df=pd.DataFrame(result)
    post_df['post_id']=post_df['post_id'].fillna(0)

    # sql2="select post_id,count() as count from post group by id;"
    #각 게시물의 like수 조회
    sql2="select post.post_id, count(likes_id) as count from post left join post_likes on post.post_id = post_likes.post_id group by post_id ;"
    cursor2.execute(sql2)
    result2=cursor2.fetchall()
    count_df=pd.DataFrame(result2)

    sql3="select distinct(post.post_id) as post_id from post join following as f on post.id=f.following_id where f.id=%s or post.id=%s;"
    cursor3.execute(sql3,(user,user))
    result3=cursor3.fetchall()
    follow_post_id=pd.DataFrame(result3)
    post_df=pd.merge(post_df,count_df,on="post_id",how="outer")

    post_df['check']=post_df['post_id'].notna().astype('int').replace(0,0.5)
    post_df['count']=post_df['count'].fillna(0)
    post_df['post_id']=post_df['post_id'].fillna(0)
    post_df['id']=post_df['id'].fillna(0)
    post_df['check']=post_df['check']*post_df['count']

    likes=post_df[['id','post_id','check']]
    # likes_matrix=likes.pivot_table('check',index='id',columns='post_id')
    likes_matrix=likes.pivot_table('check',index='id',columns='post_id')
    if 0 in likes_matrix.columns:
        likes_matrix.drop(0,axis=1,inplace=True)
    if 0 in likes_matrix.index:
        likes_matrix.drop(0,inplace=True)
        
    likes_matrix.fillna(0,inplace=True)

    likes_matrix_T=likes_matrix.transpose()
    likes_matrix_T=likes_matrix_T.fillna(0)
    likes_matrix_T.head()

    item_sim=cosine_similarity(likes_matrix_T,likes_matrix_T)

    item_sim_df=pd.DataFrame(data=item_sim,index=likes_matrix.columns,columns=likes_matrix.columns)

    item_sim_df.head(3)

    #모든 데이터에 대해서 예측 점수 계산
    def predict_likes_sim(likes_arr,item_sim_arr):
        pred=np.zeros(likes_arr.shape)
        for col in range(likes_arr.shape[1]):
            #유사도가 큰 순으로 모든 데이터 행렬의 index변환
            top_item=[np.argsort(item_sim_arr[:,col])[::-1]]
            #개인화된 예측 점수 계산
            for row in range(likes_arr.shape[0]):
                pred[row,col]=item_sim_arr[col,:][top_item].dot(likes_arr[row,:][top_item].T)
                pred[row,col]/=np.sum(np.abs(item_sim_arr[col,:][top_item]))
        return pred

    likes_pred=predict_likes_sim(likes_matrix.values,item_sim_df.values)

    likes_pred_matrix=pd.DataFrame(data=likes_pred,index=likes_matrix.index,
                                columns=likes_matrix.columns)


    user_like_id=likes_matrix.loc[user,:]
    user_like_id[user_like_id>0].sort_values(ascending=False)[:]

    #자신이 좋아요를 누른 것은 뺌
    def get_unlike_likes(likes_matrix,userId):
        user_like=likes_matrix.loc[userId,:]
        already_like=user_like[user_like>0].index.tolist()
        
        like_list=likes_matrix.columns.tolist()
        
        unlike_list=[like for like in like_list if like not in already_like]
        
        return unlike_list

    #좋아요를 누르지 않은 피드 중 예측률이 높은 순으로 정렬함
    def recomm_like_by_userid(pred_df,userId,unlike_list):
        recomm_like=pred_df.loc[userId,unlike_list].sort_values(ascending=False)[:]
        return recomm_like

    unlike_list=get_unlike_likes(likes_matrix,user)

    recomm_like=recomm_like_by_userid(likes_pred_matrix,user,unlike_list)

    r=pd.DataFrame(data=recomm_like.values,index=recomm_like.index,columns=['col'])
    try:
        follow_post_id_list=np.array(follow_post_id['post_id']).tolist()
    except KeyError:
        follow_post_id_list=[]

    recomm_like_list=np.array(recomm_like.index.values).astype('int').tolist()

    follow_post_id_list=set(follow_post_id_list)
    result=[x for x in recomm_like_list if x not in follow_post_id_list]
    if user in post_df[post_df['count']==0].id.values:
        p=post_df[post_df['post_id'].isin(result)]
        p=p.drop_duplicates(["post_id"])
        result=np.array(p.sort_values(by=['count'],ascending=False)['post_id']).astype('int').tolist()
        result={user:result}
        result=json.dumps(result)
        print(result)
    else :
        result={user:result}
        result=json.dumps(result)
        print(result)
except KeyError:
    result=dict({user:''})
    result=json.dumps(result)
    print(result)