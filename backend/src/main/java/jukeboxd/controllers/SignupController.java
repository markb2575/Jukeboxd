package jukeboxd.controllers;


import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SignupController {

  @RequestMapping(path="/signup", method=RequestMethod.POST)
  public SignupResponse signup(@RequestBody Map<String, Object> credentials) {
    System.out.println(credentials.get("username"));
    System.out.println(credentials.get("password"));
//    if (credentials.get("username") && credentials.get("password") not in database) {
//      insert credentials to database
//      return new SignupResponse(true);
//    }
    return new SignupResponse(false);
  }
  class SignupResponse {
    boolean success;
    SignupResponse(boolean success) {
      this.success = success;
    }
    public boolean getSuccess() {
      return success;
    }
  }
}