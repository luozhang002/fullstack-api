  // 导入MySQL模块
  var mysql = require('mysql');
  var dbConfig = require('../libs/db/mysql');
  var timeUtil = require('../libs/core/timeutil');
  var singleSql = require('../libs/db/singlesql');
  var pool = mysql.createPool(dbConfig.mysql );
  var commons = require("../libs/core/common");
  var cfg = require("../libs/core/config");
  var formidable = require("formidable");  
  var fs = require('fs');

  // 添加文章
  exports.addSingle = function(title,author,tag,excerpt,content,remark,headImage,resource){
    var id="s"+Date.now();
     var url = "/web/single/single?sid="+id;
    pool.getConnection(function(err, connection) {  
      var date = new Date();
      if(connection){
        connection.query(singleSql.insert, [id,title,date,author,tag,0,excerpt,content,url,headImage,resource,0,remark], function(err, result) {
          if(result) {
            console.log("插入成功"); 
          }else{
           console.log("插入失败："+err);
         }
         connection.release();  
       });
      }
      if(err){
       console.log("服务器连接失败："+err);
     }
   });
  };

  // 获取文章
  exports.getSingle = function(req, res, next){
    pool.getConnection(function(err, connection) {
      var param = req.query || req.params;
      if(connection){
        connection.query(singleSql.getArticleById, [param.sid], function(err, result) {
          if(result) {      
            commons.resSuccess(res, "操作成功",result); 
          }else{
            commons.resFail(res,1,"操作失败"+err);
          }
          connection.release();  
        });
      }
      if(err){
        commons.resFail(res,1,"服务器连接失败："+err);
      }
    });
  };

   // 获取文章列表
   exports.getSingleList = function(req, res, next){
    pool.getConnection(function(err, connection) {
      var param = req.query || req.params;
      var pageNo = param.pageNo || 1;
      var pageSize = parseInt(param.pageSize) || 10;
      var dataBegin = parseInt((pageNo -1 )*pageSize);
      if(connection){
        connection.query(singleSql.getArticleListAll, function(perr, presult) {
          if(presult) {  
            connection.query(singleSql.getArticleList, [pageSize,dataBegin], function(err, result) {
              if(result) {
                var rs={datas:result,totalCount:presult.length,pageSize:pageSize,pageNo:pageNo};
                commons.resSuccess(res, "操作成功",rs); 
              }else{
                commons.resFail(res,1,"操作失败("+err+")");
              }
            });    

          }else{
            commons.resFail(res,1,"操作失败("+perr+")");
          }
          connection.release();
        });
      }
      if(err){
        commons.resFail(res,1,"服务器连接失败："+err);
      }
    });
  };

   // 获取文章列表
   exports.getSingleListByDate = function(req, res, next){
    pool.getConnection(function(err, connection) {
      var param = req.query || req.params;
      var date = param.date || timeUtil.formatDate(new Date(),"yyyy-MM-dd");
      var isRead = parseInt(param.isRead) || 0;

      var beginDate = timeUtil.formatDate(timeUtil.getDayBeginDate(date),"yyyy-MM-dd hh:mm:ss");
      var endDate = timeUtil.formatDate(timeUtil.getDayEndDate(date),"yyyy-MM-dd hh:mm:ss");
      if(connection){
        connection.query(singleSql.getSingleByDate, [isRead,beginDate,endDate], function(err, result) {
          if(result) {
            var rs={datas:result,totalCount:result.length};
            commons.resSuccess(res, "操作成功",rs); 
          }else{
            commons.resFail(res,1,"操作失败("+err+")");
          }
        }); 
      }
      if(err){
        commons.resFail(res,1,"操作失败("+err+")");
      }
    });
  };